"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client/react"
import { UpdateScrapPricesDocument } from "@/graphql/generated/graphql"
import { appToast } from "@/lib/toast"
import { Loader2, Save, Info } from "lucide-react"

const SCRAP_FIELDS = [
  {
    key: "steel",
    label: "Steel",
    unit: "₦/kg",
    description: "Structural steel, body panels",
    color: "bg-gray-100 text-gray-600",
  },
  {
    key: "castIron",
    label: "Cast Iron",
    unit: "₦/kg",
    description: "Engine blocks, brake drums",
    color: "bg-slate-100 text-slate-600",
  },
  {
    key: "aluminum",
    label: "Aluminium",
    unit: "₦/kg",
    description: "Wheels, radiators, engine parts",
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "copper",
    label: "Copper",
    unit: "₦/kg",
    description: "Wiring harness, alternator",
    color: "bg-orange-50 text-orange-600",
  },
  {
    key: "rubber",
    label: "Rubber",
    unit: "₦/kg",
    description: "Tyres, hoses, seals",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    key: "plastics",
    label: "Plastics",
    unit: "₦/kg",
    description: "Dashboard, bumpers, trim",
    color: "bg-green-50 text-green-600",
  },
  {
    key: "glass",
    label: "Glass",
    unit: "₦/kg",
    description: "Windscreen, windows",
    color: "bg-cyan-50 text-cyan-600",
  },
] as const

type ScrapKey = typeof SCRAP_FIELDS[number]["key"]

type FormValues = Record<ScrapKey, string>

const DEFAULT_VALUES: FormValues = {
  steel: "",
  castIron: "",
  aluminum: "",
  copper: "",
  rubber: "",
  plastics: "",
  glass: "",
}

export function ScrapPricesForm() {
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES)
  const [isDirty, setIsDirty] = useState(false)

  const [updateScrapPrices, { loading }] = useMutation(
    UpdateScrapPricesDocument,
    {
      onCompleted: () => {
        appToast.success({
          title: "Scrap prices updated",
          description: "TAV calculations will use the new prices immediately",
        })
        setIsDirty(false)
      },
      onError: (err) => {
        appToast.error({
          title: "Update failed",
          description: err.message,
        })
      },
    }
  )

  function handleChange(key: ScrapKey, value: string) {
    // Only allow numbers and decimal point
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return
    setValues((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  async function handleSubmit() {
    // Build update object — only include fields that have values
    const updates: Record<string, number> = {}
    let hasAtLeastOne = false

    for (const field of SCRAP_FIELDS) {
      const val = values[field.key]
      if (val !== "" && !isNaN(Number(val)) && Number(val) > 0) {
        updates[field.key] = Number(val)
        hasAtLeastOne = true
      }
    }

    if (!hasAtLeastOne) {
      appToast.error({
        title: "No values entered",
        description: "Enter at least one scrap price to update",
      })
      return
    }

    await updateScrapPrices({
      variables: { updates },
    })
  }

  function handleReset() {
    setValues(DEFAULT_VALUES)
    setIsDirty(false)
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFF7E4] border border-[#E8A020]/30">
        <Info size={16} className="text-[#E8A020] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#E8A020]">
            How scrap prices affect TAV
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            These prices are used by the AI engine when calculating a
            vehicle's Total Asset Value. Update them regularly to reflect
            current Ladipo & Apapa market rates.
          </p>
        </div>
      </div>

      {/* Price inputs */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {SCRAP_FIELDS.map((field, index) => (
          <div
            key={field.key}
            className={`flex items-center gap-4 px-4 py-4 ${
              index < SCRAP_FIELDS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {/* Label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${field.color}`}>
                {field.label.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {field.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {field.description}
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center border border-border rounded-xl overflow-hidden focus-within:border-[#E8A020] bg-white shrink-0">
              <span className="px-3 py-2 text-xs text-muted-foreground border-r border-border bg-muted">
                ₦
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder="0.00"
                className="w-28 px-3 py-2 text-sm outline-none bg-transparent text-right"
              />
              <span className="px-2 text-xs text-muted-foreground bg-muted border-l border-border py-2">
                /kg
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!isDirty || loading}
          className="flex-1 bg-[#E8A020] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {loading ? "Updating..." : "Update Scrap Prices"}
        </button>
        {isDirty && (
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 border border-border text-sm font-bold rounded-xl hover:bg-muted/30 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
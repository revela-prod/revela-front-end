import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/AppSelect";
import CustomCta from "@/app/components/CustomCta";
import { VEHICLE_MAKES, VEHICLE_MODELS } from "@/shared/constants/vehicle-makes";


const makeOptions = VEHICLE_MAKES.map((make) => ({
  value: make,
  label: make,
}));

const locationOptions = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Ilorin", label: "Ilorin" },
];

const yearOptions = Array.from({ length: 20 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

// Base market estimates per make (₦) — intentionally approximate
// Real prices shown after login via AI TAV
const BASE_ESTIMATES: Record<string, number> = {
  "Toyota": 4500000,
  "Honda": 4200000,
  "Mercedes-Benz": 9500000,
  "BMW": 8800000,
  "Ford": 3800000,
  "Hyundai": 3500000,
  "Kia": 3200000,
  "Lexus": 11000000,
  "Nissan": 3600000,
  "Volkswagen": 4100000,
  "Audi": 8500000,
  "Chevrolet": 3400000,
  "Land Rover": 14000000,
  "Jeep": 6500000,
  "Peugeot": 2800000,
  "Mitsubishi": 3300000,
  "Mazda": 3700000,
  "Subaru": 4000000,
  "Infiniti": 7500000,
  "Porsche": 22000000,
  "Acura": 6000000,
  "Volvo": 7800000,
  "Isuzu": 5500000,
  "GAC": 3100000,
}

function calculateEstimate(
  make: string,
  year: string,
  condition: string,
  location: string
): number {
  const base = BASE_ESTIMATES[make] ?? 3500000

  // Year multiplier — newer = more valuable
  const currentYear = new Date().getFullYear()
  const age = currentYear - Number(year)
  const yearMultiplier = Math.max(0.4, 1 - age * 0.05)

  // Condition multiplier
  const conditionStr = condition.toLowerCase()
  let conditionMultiplier = 1.0
  if (conditionStr.includes("perfect") || conditionStr.includes("excellent")) {
    conditionMultiplier = 1.08
  } else if (conditionStr.includes("good") || conditionStr.includes("clean")) {
    conditionMultiplier = 1.0
  } else if (conditionStr.includes("dent") || conditionStr.includes("scratch") || conditionStr.includes("minor")) {
    conditionMultiplier = 0.92
  } else if (conditionStr.includes("bad") || conditionStr.includes("poor") || conditionStr.includes("damage")) {
    conditionMultiplier = 0.75
  }

  // Location multiplier
  const locationMultipliers: Record<string, number> = {
    Lagos: 1.0,
    Abuja: 1.04,
    Ilorin: 0.94,
  }
  const locationMultiplier = locationMultipliers[location] ?? 1.0

  return Math.round(base * yearMultiplier * conditionMultiplier * locationMultiplier)
}

export default function ModelCard() {
  const [make, setMake] = useState("Toyota")
  const [model, setModel] = useState("")
  const [year, setYear] = useState(String(new Date().getFullYear() - 3))
  const [condition, setCondition] = useState("")
  const [location, setLocation] = useState("Lagos")
  const [offer, setOffer] = useState(0)

  // Derive model options from our constants based on selected make
  const modelOptions = useMemo(() => {
    const models = VEHICLE_MODELS[make as keyof typeof VEHICLE_MODELS] ?? []
    return models.map((m: string) => ({ value: m, label: m }))
  }, [make])

  // Reset model when make changes
  useEffect(() => {
    setModel(modelOptions[0]?.value ?? "")
  }, [make, modelOptions])

  // Recalculate on any change
  useEffect(() => {
    const result = calculateEstimate(make, year, condition, location)
    setOffer(result)
  }, [make, year, condition, location])

  const formattedOffer = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(offer)

  return (
    <Card className="w-full md:w-100 lg:w-125 max-w-125 bg-[#F9FAFB] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[#F3F4F6] overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex justify-between font-cabinet items-center mb-8">
          <h2 className="text-base font-bold tracking-[1px] text-(--ink) uppercase">
            Sell a car
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--ink) animate-pulse" />
            <span className="text-[12px] font-bold tracking-[1px] text-(--ink) uppercase">
              Live Estimate
            </span>
          </div>
        </div>

        <div className="space-y-4">
          
          <div className="font-cabinet">
            <label className="text-sm mb-2 block font-bold text-(--ink)">
              Vehicle Details
            </label>
            <div className="grid grid-cols-3 gap-2">
              <AppSelect
                value={make}
                onValueChange={setMake}
                placeholder="Make"
                options={makeOptions}
                className=" truncate"
              />
              <AppSelect
                value={model}
                onValueChange={setModel}
                placeholder="Model"
                options={modelOptions}
              />
              <AppSelect
                value={year}
                onValueChange={setYear}
                placeholder="Year"
                options={yearOptions}
              />
            </div>
          </div>


          <div className="space-y-1.5">
            <label className="text-sm mb-2 block font-bold text-(--ink)">
              Condition
            </label>
            <Input
              value={condition}
              onChange={(e: any) => setCondition(e.target.value)}
              placeholder="e.g., Minor dents, runs well"
              className="border-[#E098001A] bg-[#FFF9F099] font-cabinet font-normal text-base shadow-none text-gray-700 h-10 placeholder:text-gray-400 focus-visible:ring-[#F9FAFB]"
            />
          </div>

          
          <div className="space-y-1.5">
            <label className="text-sm mb-2 block font-bold text-(--ink)">
              Location
            </label>
            <AppSelect
              value={location}
              onValueChange={setLocation}
              placeholder="Location"
              options={locationOptions}
            />
          </div>
        </div>

        
        <div className="mt-8 bg-[#E098001A] border border-[#E0980033] rounded-[10px] p-5 sm:p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-[11px] font-medium tracking-widest text-gray-600 uppercase">
              Estimated Offer
            </h3>
            
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Estimate only
            </span>
          </div>

          <div className="h-12 flex items-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={offer}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-4xl sm:text-[42px] font-bold text-[#D08B25] tracking-tight"
              >
                {formattedOffer}
              </motion.div>
            </AnimatePresence>
          </div>

          
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            This is a rough market estimate. Your{" "}
            <span className="font-bold text-[#D08B25]">actual offer</span>{" "}
            is determined by our AI after you submit your vehicle —
            log in to get your real valuation.
          </p>
        </div>

        <CustomCta
          href="/login"
          label="Get My Real Offer →"
          className="w-full text-white mt-3"
        />
      </CardContent>
    </Card>
  )
}
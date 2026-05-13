"use client"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { TextField } from "@/components/ui/textfield"
import { Building2, FileCheck } from "lucide-react"
import { useAgentStep2 } from "../../hooks/agents/useAgentStep2"
import { FileDropzone } from "@/components/ui/file-dropzone"

const ACCEPTED_IDS = [
  "National ID (NIN)",
  "Driver's License",
  "International Passport",
  "Voter's Card",
]

export default function AgentStep2() {
  const { form, onNext, goBack } = useAgentStep2()
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  return (
    <div className="font-cabinet">
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold text-[#D4900A]">
          Business Context
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Help us verify your agency credentials
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
        noValidate
      >
        <FieldGroup>
          <TextField
            id="agencyName"
            label="Agency Name"
            placeholder="Revela Motors Ltd"
            rightIcon={<Building2 size={20} className="text-[#BDCABB]" />}
            error={errors.agencyName?.message}
            {...register("agencyName")}
          />

        
          <div className="space-y-2">
            <FileDropzone
              label="Valid Means of Identification"
              selectedFile={watch("license")}
              onFileChange={(file) => {
                setValue("license", file as File, { shouldValidate: true })
              }}
              error={errors.license?.message}
            />
            
            <div className="flex flex-wrap items-center gap-2">
              <FileCheck size={12} className="text-[#E8A020]" />
              <p className="text-[11px] font-medium text-[#6A6A6A]">
                Accepted:
              </p>
              {ACCEPTED_IDS.map((id, i) => (
                <span
                  key={id}
                  className="rounded-full bg-[#FFF7E4] px-2 py-0.5 text-[10px] font-bold text-[#E8A020]"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </FieldGroup>

        <div className="mt-10 flex gap-3">
          <Button type="button" onClick={goBack} className="w-full text-white">
            <span className="rotate-180">→</span> Back
          </Button>
          <Button type="submit" className="w-full text-white">
            Continue <span>→</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AddVehicleCardProps {
  to?: string;
}

export const AddVehicleCard: React.FC<AddVehicleCardProps> = ({
  to = "/user/vehicles/add",
}) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="w-full min-h-[320px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all p-6 flex flex-col items-center justify-center text-center group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
    >
      <div className="h-12 w-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 group-hover:scale-105 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
        <Plus className="h-5 w-5 stroke-[2.5]" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        Add New Vehicle
      </h3>

      <p className="mt-1 text-xs text-slate-500 max-w-[200px] leading-relaxed">
        Register another car or bike for roadside protection.
      </p>
    </button>
  );
};
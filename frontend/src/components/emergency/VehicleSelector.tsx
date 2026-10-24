import type { Vehicle } from "@/types/user/vehicle";

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelect: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
  loading: boolean;
}

export default function VehicleSelector({
  vehicles,
  selectedVehicleId,
  onSelect,
  onAddVehicle,
  loading,
}: VehicleSelectorProps) {
  if (loading) {
    return <p>Loading your vehicles...</p>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        Select Your Vehicle
      </h2>

      {vehicles.length === 0 ? (
        <p>You haven't added any vehicles yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((vehicle) => {
            const id = vehicle.id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(vehicle)}
                className={`rounded-xl border p-4 text-left ${
                  selectedVehicleId === id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>

                <p className="text-sm text-gray-500">
                  {vehicle.registrationNumber}
                </p>

                <p className="mt-2 text-sm">
                  {selectedVehicleId === id
                    ? "Selected"
                    : "Select this vehicle"}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onAddVehicle}
        className="rounded-lg border border-purple-600 px-4 py-2 text-purple-700"
      >
        + Add Vehicle
      </button>
    </section>
  );
}
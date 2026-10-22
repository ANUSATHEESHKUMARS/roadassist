// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import type {
//   MechanicApplicationDTO,
//   MechanicApplicationStatus,
//   MechanicServiceModel,
//   MechanicStats,
// } from "@/types/admin/mechanic";
// import { getMechanicApplications } from "@/services/admin/mechanicService";
// import { MechanicManagementHeader } from "@/components/admin/mechanic/MechanicManagementHeader";
// import { MechanicStatsCards } from "@/components/admin/mechanic/MechanicStatsCards";
// import { MechanicSearchAndFilters } from "@/components/admin/mechanic/MechanicSearchAndFilters";
// import { MechanicApplicationTable } from "@/components/admin/mechanic/MechanicApplicationTable";
// import { UserPagination } from "@/components/admin/user/UserPagination";
// import { useToast } from "@/components/ui/toast/ToastProvider";

// export default function AdminMechanicPage() {
//   const [applications, setApplications] = useState<MechanicApplicationDTO[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<MechanicApplicationStatus | "all">("pending");
//   const [serviceModelFilter, setServiceModelFilter] = useState<MechanicServiceModel | "all">("all");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const { showToast } = useToast();

//   const fetchApplications = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getMechanicApplications(
//         statusFilter === "all" ? undefined : statusFilter
//       );
//       setApplications(data || []);
//       setCurrentPage(1);
//     } catch (err: unknown) {
//       console.error("Failed to load mechanic applications:", err);
//       setError("Failed to load mechanic applications. Please check connection.");
//       showToast("Could not retrieve applications", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [statusFilter, showToast]);

//   useEffect(() => {
//     fetchApplications();
//   }, [fetchApplications]);

//   // Client-side search & model filtering
//   const filteredApplications = useMemo(() => {
//     return applications.filter((app) => {
//       if (serviceModelFilter !== "all" && app.serviceModel !== serviceModelFilter) {
//         return false;
//       }

//       if (searchQuery.trim()) {
//         const q = searchQuery.toLowerCase();
//         const id = (app.id || app._id || "").toLowerCase();
//         const address = (app.serviceAddress || "").toLowerCase();
//         const workshop = (app.workshopName || "").toLowerCase();
//         const name =
//           typeof app.userId === "object" && app.userId?.fullName
//             ? app.userId.fullName.toLowerCase()
//             : "";

//         const matches =
//           id.includes(q) ||
//           address.includes(q) ||
//           workshop.includes(q) ||
//           name.includes(q) ||
//           (app.specialization || []).some((s) => s.toLowerCase().includes(q));

//         if (!matches) return false;
//       }

//       return true;
//     });
//   }, [applications, searchQuery, serviceModelFilter]);

//   // Client-side pagination over filtered records
//   const paginatedApplications = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredApplications.slice(start, start + pageSize);
//   }, [filteredApplications, currentPage, pageSize]);

//   const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));

//   // Authoritative counters for loaded applications
//   const stats: MechanicStats = useMemo(() => {
//     return {
//       total: applications.length,
//       pending: applications.filter((a) => a.status === "pending").length,
//       underReview: applications.filter((a) => a.status === "under_review").length,
//       approved: applications.filter((a) => a.status === "approved").length,
//       rejected: applications.filter((a) => a.status === "rejected").length,
//     };
//   }, [applications]);

//   const handleResetFilters = () => {
//     setSearchQuery("");
//     setStatusFilter("pending");
//     setServiceModelFilter("all");
//     setCurrentPage(1);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <MechanicManagementHeader
//         onRefresh={fetchApplications}
//         isLoading={isLoading}
//       />

//       {/* Stats Cards */}
//       <MechanicStatsCards stats={stats} />

//       {/* Search and Filters */}
//       <MechanicSearchAndFilters
//         searchQuery={searchQuery}
//         statusFilter={statusFilter}
//         serviceModelFilter={serviceModelFilter}
//         onSearchChange={(val) => {
//           setSearchQuery(val);
//           setCurrentPage(1);
//         }}
//         onStatusChange={(val) => {
//           setStatusFilter(val);
//           setCurrentPage(1);
//         }}
//         onServiceModelChange={(val) => {
//           setServiceModelFilter(val);
//           setCurrentPage(1);
//         }}
//         onReset={handleResetFilters}
//       />

//       {/* Error State */}
//       {error && (
//         <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
//           <p className="text-xs text-destructive">{error}</p>
//         </div>
//       )}

//       {/* Applications Table */}
//       <MechanicApplicationTable
//         applications={paginatedApplications}
//         isLoading={isLoading}
//       />

//       {/* Reused Pagination Component */}
//       <UserPagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         totalRecords={filteredApplications.length}
//         pageSize={pageSize}
//         onPageChange={setCurrentPage}
//         onPageSizeChange={(size) => {
//           setPageSize(size);
//           setCurrentPage(1);
//         }}
//         recordLabel="applications"
//       />
//     </div>
//   );
// }
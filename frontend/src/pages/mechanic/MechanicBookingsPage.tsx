import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CalendarCheck2,
    Car,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    IndianRupee,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Sparkles,
    UserRound,
    Wrench,
    X,
} from "lucide-react";

import { getApiErrorMessage } from "@/api/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mechanicCategoryService } from "@/services/admin/mechanicCategoryService";
import { scheduledBookingService } from "@/services/booking/scheduledBookingService";
import type {
    GetMechanicBookingsResponse,
    MechanicBookingFilterTab,
    MechanicBookingSort,
} from "@/types/user/scheduledBooking";
import {
    BOOKING_STATUS_STYLES,
    PAYMENT_STATUS_STYLES,
    formatBookingTimingsLabel,
    formatIndiaBookingDate,
} from "@/utils/scheduledBookingFormat";

const FILTER_TABS: { key: MechanicBookingFilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "today", label: "Today" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
];

const PAGE_LIMIT = 8;

export default function MechanicBookingsPage() {
    const [activeFilter, setActiveFilter] =
        useState<MechanicBookingFilterTab>("all");
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [sortOrder, setSortOrder] =
        useState<MechanicBookingSort>("upcoming");
    const [page, setPage] = useState(1);

    const [serviceOptions, setServiceOptions] = useState<string[]>([]);
    const [data, setData] = useState<GetMechanicBookingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);

    // Debounce search input without triggering duplicate requests
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch((prev) => {
                const next = searchInput.trim();
                if (prev !== next) {
                    setPage(1);
                }
                return next;
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    // Load active categories once for optional service filtering
    useEffect(() => {
        let cancelled = false;

        const loadCategories = async () => {
            try {
                const categories = await mechanicCategoryService.getAll(false);
                if (cancelled || !Array.isArray(categories)) return;

                const names: string[] = [];
                for (const category of categories) {
                    if (category.isActive && category.name?.trim()) {
                        names.push(category.name.trim());
                    }
                    for (const sub of category.subcategories ?? []) {
                        if (sub.isActive && sub.name?.trim()) {
                            names.push(sub.name.trim());
                        }
                    }
                }
                setServiceOptions(Array.from(new Set(names)));
            } catch {
                // Keep manual/category list optional if categories endpoint fails
            }
        };

        void loadCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchBookings = async () => {
            try {
                setError(null);
                const result = await scheduledBookingService.getMechanicBookings(
                    {
                        page,
                        limit: PAGE_LIMIT,
                        filter: activeFilter,
                        ...(debouncedSearch ? { search: debouncedSearch } : {}),
                        ...(dateFilter ? { date: dateFilter } : {}),
                        ...(serviceFilter ? { serviceType: serviceFilter } : {}),
                        sort: sortOrder,
                    }
                );

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        void fetchBookings();
        return () => {
            cancelled = true;
        };
    }, [
        page,
        activeFilter,
        debouncedSearch,
        dateFilter,
        serviceFilter,
        sortOrder,
        reloadTick,
    ]);

    const handleFilterTabChange = useCallback(
        (tab: MechanicBookingFilterTab) => {
            if (tab === activeFilter) return;
            setLoading(true);
            setActiveFilter(tab);
            setSortOrder(
                tab === "completed" || tab === "cancelled"
                    ? "newest"
                    : "upcoming"
            );
            setPage(1);
        },
        [activeFilter]
    );

    const handleClearFilters = () => {
        setLoading(true);
        setSearchInput("");
        setDebouncedSearch("");
        setDateFilter("");
        setServiceFilter("");
        setActiveFilter("all");
        setSortOrder("upcoming");
        setPage(1);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setReloadTick((t) => t + 1);
    };

    const counts = data?.counts ?? {
        total: 0,
        upcoming: 0,
        today: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
    };

    const pagination = data?.pagination;
    const bookings = data?.bookings ?? [];
    const hasActiveFilters = Boolean(
        debouncedSearch || dateFilter || serviceFilter || activeFilter !== "all"
    );

    const tabCountMap: Record<MechanicBookingFilterTab, number> = {
        all: counts.total,
        upcoming: counts.upcoming,
        today: counts.today,
        in_progress: counts.inProgress,
        completed: counts.completed,
        cancelled: counts.cancelled,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Scheduled Bookings
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        View confirmed customer bookings assigned to your account
                        and track active service progress.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw
                        className={`mr-1.5 h-3.5 w-3.5 ${
                            refreshing ? "animate-spin" : ""
                        }`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Total Bookings</span>
                            <CalendarCheck2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {counts.total}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Upcoming</span>
                            <Calendar className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {counts.upcoming}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Today&apos;s Bookings</span>
                            <Sparkles className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {counts.today}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>In Progress</span>
                            <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {counts.inProgress}
                        </p>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border-border bg-card sm:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Completed</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {counts.completed}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleFilterTabChange(tab.key)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                                isActive
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                    isActive
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {tabCountMap[tab.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search & Filters */}
            <Card className="border-border bg-card">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                        <div className="relative md:col-span-4">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by customer name or booking ID..."
                                aria-label="Search bookings"
                                className="h-9 bg-input pl-8 text-xs"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setLoading(true);
                                    setDateFilter(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Filter by scheduled date"
                                className="h-9 bg-input text-xs"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <select
                                value={serviceFilter}
                                onChange={(e) => {
                                    setLoading(true);
                                    setServiceFilter(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Filter by service category"
                                className="h-9 w-full rounded-md border border-border bg-input px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="">All Services</option>
                                {serviceOptions.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                            <select
                                value={sortOrder}
                                onChange={(e) => {
                                    setLoading(true);
                                    setSortOrder(
                                        e.target.value as MechanicBookingSort
                                    );
                                    setPage(1);
                                }}
                                aria-label="Sort bookings"
                                className="h-9 w-full rounded-md border border-border bg-input px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="upcoming">Upcoming First</option>
                                <option value="newest">Newest First</option>
                            </select>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    title="Clear filters"
                                    className="shrink-0 px-2.5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className="animate-pulse rounded-2xl border border-border bg-card p-5 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-44 rounded bg-muted" />
                                <div className="h-5 w-24 rounded-full bg-muted" />
                            </div>
                            <div className="h-3 w-72 rounded bg-muted" />
                            <div className="h-3 w-56 rounded bg-muted" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Unable to load mechanic bookings
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {error}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLoading(true);
                                setReloadTick((t) => t + 1);
                            }}
                        >
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !error && bookings.length === 0 && (
                <Card className="border-border bg-card">
                    <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <CalendarCheck2 className="h-6 w-6" />
                        </div>
                        <div className="max-w-md space-y-1">
                            <h2 className="text-base font-semibold text-foreground">
                                {hasActiveFilters
                                    ? "No bookings match your filters"
                                    : "No confirmed bookings yet"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {hasActiveFilters
                                    ? "Try clearing your search term, date, or status filter."
                                    : "Confirmed bookings assigned to you after customer payment verification will appear here."}
                            </p>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Bookings List */}
            {!loading && !error && bookings.length > 0 && (
                <div className="space-y-3">
                    {bookings.map((booking) => {
                        const statusCfg = BOOKING_STATUS_STYLES[booking.status];
                        const paymentCfg = booking.paymentStatus
                            ? PAYMENT_STATUS_STYLES[booking.paymentStatus]
                            : null;

                        return (
                            <Card
                                key={booking.bookingId}
                                className="border-border bg-card transition-colors hover:border-primary/40"
                            >
                                <CardContent className="p-5">
                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                        <div className="min-w-0 flex-1 space-y-3">
                                            {/* Header row */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                                                    {booking.bookingReference}
                                                </span>

                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.badgeClass}`}
                                                >
                                                    {statusCfg.label}
                                                </span>

                                                {paymentCfg && (
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${paymentCfg.badgeClass}`}
                                                    >
                                                        {paymentCfg.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Service + Category */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Wrench className="h-4 w-4 shrink-0 text-primary" />
                                                <h3 className="text-sm font-bold text-foreground">
                                                    {booking.serviceCategory
                                                        ?.subcategoryName ||
                                                        booking.serviceType}
                                                </h3>
                                                {booking.serviceCategory && (
                                                    <span className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                                                        {booking.serviceCategory
                                                            .categoryName}
                                                        {booking.serviceCategory
                                                            .subcategoryName &&
                                                        booking.serviceCategory
                                                            .subcategoryName !==
                                                            booking.serviceCategory
                                                                .categoryName
                                                            ? ` • ${booking.serviceCategory.subcategoryName}`
                                                            : ""}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Metadata Grid */}
                                            <div className="grid grid-cols-1 gap-x-5 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                                                <span className="flex items-center gap-1.5 text-foreground">
                                                    <UserRound className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    <span className="truncate font-medium">
                                                        {booking.customer
                                                            ?.fullName ??
                                                            "Customer"}
                                                    </span>
                                                </span>

                                                <span className="flex items-center gap-1.5">
                                                    <Car className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    <span className="truncate">
                                                        {booking.vehicle
                                                            ? `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.registrationNumber})`
                                                            : booking.vehicleId}
                                                    </span>
                                                </span>

                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    <span>
                                                        {formatIndiaBookingDate(
                                                            booking.scheduledDate
                                                        )}
                                                    </span>
                                                </span>

                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    <span className="truncate">
                                                        {formatBookingTimingsLabel(
                                                            booking.slot,
                                                            booking.scheduleTimings
                                                        )}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                                <span className="line-clamp-1">
                                                    {booking.serviceAddress}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Action Column */}
                                        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-3 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                                            <div className="lg:text-right">
                                                <p className="text-[11px] text-muted-foreground">
                                                    Booking Fee
                                                </p>
                                                <p className="flex items-center gap-0.5 text-base font-bold text-foreground">
                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                    {booking.bookingAmount}
                                                </p>
                                            </div>

                                            <Link
                                                to={`/mechanic/bookings/${booking.bookingId}`}
                                            >
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5"
                                                >
                                                    View Details
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} •{" "}
                        {pagination.total} bookings
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => {
                                setLoading(true);
                                setPage((p) => Math.max(1, p - 1));
                            }}
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Prev
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasNextPage}
                            onClick={() => {
                                setLoading(true);
                                setPage((p) => p + 1);
                            }}
                        >
                            Next
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {refreshing && !loading && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating bookings...</span>
                </div>
            )}
        </div>
    );
}


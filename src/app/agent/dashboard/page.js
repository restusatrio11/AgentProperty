"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import * as XLSX from "xlsx";

import { hasPermission, MENU_ITEMS, ROLES, ACTIONS, RESOURCES } from "@/lib/rbac";
import { 
  LayoutDashboard, 
  Building2, 
  ShieldAlert, 
  History, 
  Users, 
  Activity, 
  Key, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Trash2, 
  FileUp, 
  Plus, 
  Filter, 
  Search, 
  AlertTriangle, 
  Download,
  Info,
  Check,
  X,
  Pencil,
  Eye,
  EyeOff,
  Save,
  Clock,
  Shield,
  SlidersHorizontal,
  MessageSquare,
  Zap,
  Star,
  Ban,
  ToggleRight
} from "lucide-react";

// Dynamic loading of ApexCharts to prevent SSR window issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Form initial state
const initialFormState = {
  namaProperti: "",
  groupName: "",
  lebar: "",
  panjang: "",
  hadap: [],
  tipe: "VILLA",
  tingkat: "1.0",
  price: "",
  carport: false,
  status: "in_stock",
  siap: "siap_huni",
  mapsLink: "",
  lat: 3.5952,
  lng: 98.6722,
  kawasan: [],
  unit: "",
};

// Available filter/option categories
const KAWASANS = ["Krakatau", "Pancing", "Cemara Asri", "Helvetia", "Tembung", "Medan Johor", "Setiabudi"];
const HADAPS = ["UTARA", "SELATAN", "TIMUR", "BARAT"];
const SIAPS = [
  { value: "siap_huni", label: "Siap Huni" },
  { value: "siap_kosong", label: "Siap Kosong" },
  { value: "siap_huni_renovasi", label: "Siap Huni Renovasi" },
];

// Reusable Searchable Dropdown Select Component
function SearchableSelect({ options, value, onChange, placeholder = "Pilih..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.searchableSelectContainer}`)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : placeholder;
  }, [options, value, placeholder]);

  return (
    <div className={styles.searchableSelectContainer}>
      <button
        type="button"
        className={styles.searchableSelectBtn}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
      >
        <span className={styles.searchableSelectValue}>{selectedLabel}</span>
        <span className={styles.searchableSelectChevron}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.searchableSelectDropdown}>
          <div className={styles.searchableSelectSearchWrapper}>
            <input
              type="text"
              className={styles.searchableSelectSearchInput}
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.searchableSelectOptions}>
            {filteredOptions.length === 0 ? (
              <div className={styles.searchableSelectNoOptions}>Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.searchableSelectOption} ${
                      isSelected ? styles.searchableSelectOptionSelected : ""
                    }`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    {opt.label}
                    {isSelected && <Check size={12} className={styles.searchableSelectCheck} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Multi-select Dropdown Component
function MultiSelectDropdown({ options, selectedValues = [], onChange, placeholder = "Pilih..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.multiSelectDropdownContainer}`)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedLabels = useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) return placeholder;
    const labels = selectedValues.map((val) => {
      const found = options.find((opt) => opt.value === val);
      return found ? found.label : val;
    });
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} (+${labels.length - 2})`;
  }, [selectedValues, options, placeholder]);

  return (
    <div className={styles.multiSelectDropdownContainer}>
      <button
        type="button"
        className={styles.multiSelectDropdownBtn}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
      >
        <span className={styles.multiSelectDropdownValue}>{selectedLabels}</span>
        <span className={styles.multiSelectDropdownChevron}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.multiSelectDropdownMenu}>
          <div className={styles.multiSelectDropdownSearchWrapper}>
            <input
              type="text"
              className={styles.multiSelectDropdownSearchInput}
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.multiSelectDropdownOptions}>
            {filteredOptions.length === 0 ? (
              <div className={styles.multiSelectDropdownNoOptions}>Tidak ada hasil</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <label key={opt.value} className={styles.multiSelectDropdownOptionItem}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const updated = isChecked
                          ? selectedValues.filter((val) => val !== opt.value)
                          : [...selectedValues, opt.value];
                        onChange(updated);
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function AgentDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, properti, audit, etc.
  const [role, setRole] = useState("ADMIN"); // SUPERADMIN or ADMIN

  // Column visibility states
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    groupName: true,
    dimensi: true,
    hadap: true,
    tipe: true,
    tingkat: true,
    price: true,
    carport: true,
    status: true,
    siap: true,
    kawasan: true,
    createdAt: true,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Admin Management states
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [adminFormMode, setAdminFormMode] = useState("create"); // create or edit
  const [adminFormData, setAdminFormData] = useState({ id: "", nama: "", email: "", password: "", role: "ADMIN", isActive: true });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetAdminId, setResetAdminId] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [isDeleteAdminOpen, setIsDeleteAdminOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  // Search, Paging, Sort, Filter states for Audit Logs
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilterAction, setAuditFilterAction] = useState("");
  const [auditFilterModule, setAuditFilterModule] = useState("");
  const [auditSortField, setAuditSortField] = useState("createdAt");
  const [auditSortDirection, setAuditSortDirection] = useState("desc");
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(50);

  // Search, Paging, Sort, Filter states for Active Sessions
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilterStatus, setSessionFilterStatus] = useState("");
  const [sessionSortField, setSessionSortField] = useState("loginTime");
  const [sessionSortDirection, setSessionSortDirection] = useState("desc");
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(50);

  // Search, Paging, Sort, Filter states for Admins Table
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilterRole, setAdminFilterRole] = useState("");
  const [adminFilterStatus, setAdminFilterStatus] = useState("");
  const [adminSortField, setAdminSortField] = useState("createdAt");
  const [adminSortDirection, setAdminSortDirection] = useState("desc");
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(50);

  // Search, Sort, Filter states for RBAC Matrix Table
  const [rbacSearch, setRbacSearch] = useState("");
  const [rbacSortField, setRbacSortField] = useState("resourceLabel");
  const [rbacSortDirection, setRbacSortDirection] = useState("asc");
  
  // Dynamic Otorisasi states
  const [permissionsMatrix, setPermissionsMatrix] = useState(null);
  const [matrixMetadata, setMatrixMetadata] = useState({ resources: [], actions: [] });
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  // Helper to check permission dynamically
  const checkPermission = (resource, action) => {
    return hasPermission(role, resource, action, permissionsMatrix);
  };
  
  // Property and log states
  const [properties, setProperties] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Selected row / drawer state
  const [selectedProperty, setSelectedProperty] = useState(null);

  // CRUD Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);
  const [formMode, setFormMode] = useState("create"); // create or edit
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    type: "warning", // warning, danger, success
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const [formStep, setFormStep] = useState(1);

  // Active Sessions states
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Row selection and pagination states
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showFilters, setShowFilters] = useState(false);


  // CSV Import Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  // Testimonial & Message States
  const [adminTestimonials, setAdminTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialSearch, setTestimonialSearch] = useState("");
  const [testimonialSortField, setTestimonialSortField] = useState("createdAt");
  const [testimonialSortDirection, setTestimonialSortDirection] = useState("desc");
  const [testimonialCurrentPage, setTestimonialCurrentPage] = useState(1);
  const [testimonialPageSize, setTestimonialPageSize] = useState(25);

  const [adminMessages, setAdminMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageSortField, setMessageSortField] = useState("createdAt");
  const [messageSortDirection, setMessageSortDirection] = useState("desc");
  const [messageCurrentPage, setMessageCurrentPage] = useState(1);
  const [messagePageSize, setMessagePageSize] = useState(25);

  // Custom sorting states
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Sorting logic for properties listing
  const sortedProperties = useMemo(() => {
    if (!sortField) return properties;
    
    return [...properties].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle arrays (like kawasan or hadap)
      if (Array.isArray(aVal)) aVal = aVal.join(", ");
      if (Array.isArray(bVal)) bVal = bVal.join(", ");
      
      // Handle nulls/undefined
      if (aVal === null || aVal === undefined) return sortDirection === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortDirection === "asc" ? -1 : 1;
      
      if (typeof aVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // Numeric sort
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [properties, sortField, sortDirection]);

  // Paginated properties for custom table
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProperties.slice(startIndex, startIndex + pageSize);
  }, [sortedProperties, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProperties.length / pageSize) || 1;
  }, [sortedProperties.length, pageSize]);

  // Adjust current page if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Checkbox selections helpers
  const isAllPageSelected = useMemo(() => {
    return paginatedProperties.length > 0 && paginatedProperties.every((p) => selectedIds.includes(p.id));
  }, [paginatedProperties, selectedIds]);

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      // Unselect all items on the current page
      const pageIds = paginatedProperties.map((p) => p.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      // Select all items on the current page
      const pageIds = paginatedProperties.map((p) => p.id);
      setSelectedIds((prev) => {
        const newSelection = [...prev];
        pageIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Standard sorting helper
  const sortData = (data, field, direction) => {
    if (!field) return data;
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (aVal === null || aVal === undefined) return direction === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return direction === "asc" ? -1 : 1;
      if (typeof aVal === "string") {
        return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  // Testimonials Logic
  const filteredTestimonials = useMemo(() => {
    let result = [...adminTestimonials];
    if (testimonialSearch.trim()) {
      const q = testimonialSearch.toLowerCase().trim();
      result = result.filter(t => 
        t.nama.toLowerCase().includes(q) || 
        t.content.toLowerCase().includes(q) || 
        t.role?.toLowerCase().includes(q)
      );
    }
    return sortData(result, testimonialSortField, testimonialSortDirection);
  }, [adminTestimonials, testimonialSearch, testimonialSortField, testimonialSortDirection]);

  const paginatedTestimonials = useMemo(() => {
    const start = (testimonialCurrentPage - 1) * testimonialPageSize;
    return filteredTestimonials.slice(start, start + testimonialPageSize);
  }, [filteredTestimonials, testimonialCurrentPage, testimonialPageSize]);

  const testimonialTotalPages = Math.ceil(filteredTestimonials.length / testimonialPageSize) || 1;

  const handleTestimonialSort = (field) => {
    if (testimonialSortField === field) {
      setTestimonialSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setTestimonialSortField(field);
      setTestimonialSortDirection("asc");
    }
  };

  // Messages Logic
  const filteredMessages = useMemo(() => {
    let result = [...adminMessages];
    if (messageSearch.trim()) {
      const q = messageSearch.toLowerCase().trim();
      result = result.filter(m => 
        m.nama.toLowerCase().includes(q) || 
        m.pesan.toLowerCase().includes(q) || 
        m.subjek?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      );
    }
    return sortData(result, messageSortField, messageSortDirection);
  }, [adminMessages, messageSearch, messageSortField, messageSortDirection]);

  const paginatedMessages = useMemo(() => {
    const start = (messageCurrentPage - 1) * messagePageSize;
    return filteredMessages.slice(start, start + messagePageSize);
  }, [filteredMessages, messageCurrentPage, messagePageSize]);

  const messageTotalPages = Math.ceil(filteredMessages.length / messagePageSize) || 1;

  const handleMessageSort = (field) => {
    if (messageSortField === field) {
      setMessageSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setMessageSortField(field);
      setMessageSortDirection("asc");
    }
  };

  // Audit Logs filtering, sorting, pagination
  const filteredAuditLogs = useMemo(() => {
    let result = [...auditLogs];

    // Search query
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase().trim();
      result = result.filter(log => {
        const email = log.user?.email?.toLowerCase() || "system";
        const summary = log.changeSummary?.toLowerCase() || "";
        const action = log.actionType?.toLowerCase() || "";
        const entity = log.entityName?.toLowerCase() || "";
        const ip = log.ipAddress?.toLowerCase() || "";
        return email.includes(q) || summary.includes(q) || action.includes(q) || entity.includes(q) || ip.includes(q);
      });
    }

    // Filter by Action
    if (auditFilterAction) {
      result = result.filter(log => log.actionType === auditFilterAction);
    }

    // Filter by Module
    if (auditFilterModule) {
      result = result.filter(log => log.entityName === auditFilterModule);
    }

    return result;
  }, [auditLogs, auditSearch, auditFilterAction, auditFilterModule]);

  const sortedAuditLogs = useMemo(() => {
    return [...filteredAuditLogs].sort((a, b) => {
      let aVal = a[auditSortField];
      let bVal = b[auditSortField];

      // Handle user relation sorting
      if (auditSortField === "user") {
        aVal = a.user?.email || "system";
        bVal = b.user?.email || "system";
      }

      if (aVal === null || aVal === undefined) return auditSortDirection === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return auditSortDirection === "asc" ? -1 : 1;

      if (typeof aVal === "string") {
        return auditSortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return auditSortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredAuditLogs, auditSortField, auditSortDirection]);

  const paginatedAuditLogs = useMemo(() => {
    const startIndex = (auditCurrentPage - 1) * auditPageSize;
    return sortedAuditLogs.slice(startIndex, startIndex + auditPageSize);
  }, [sortedAuditLogs, auditCurrentPage, auditPageSize]);

  const auditTotalPages = useMemo(() => {
    return Math.ceil(sortedAuditLogs.length / auditPageSize) || 1;
  }, [sortedAuditLogs.length, auditPageSize]);

  useEffect(() => {
    if (auditCurrentPage > auditTotalPages) {
      setAuditCurrentPage(auditTotalPages);
    }
  }, [auditTotalPages, auditCurrentPage]);

  // Active Sessions filtering, sorting, pagination
  const filteredActiveSessions = useMemo(() => {
    let result = [...activeSessions];

    // Search query
    if (sessionSearch.trim()) {
      const q = sessionSearch.toLowerCase().trim();
      result = result.filter(session => {
        const email = session.email?.toLowerCase() || "";
        const device = session.deviceName?.toLowerCase() || "";
        const ip = session.ipAddress?.toLowerCase() || "";
        const ua = session.rawUserAgent?.toLowerCase() || "";
        return email.includes(q) || device.includes(q) || ip.includes(q) || ua.includes(q);
      });
    }

    // Filter by Status
    if (sessionFilterStatus) {
      if (sessionFilterStatus === "current") {
        result = result.filter(session => session.isCurrent);
      } else if (sessionFilterStatus === "active") {
        result = result.filter(session => !session.isCurrent);
      }
    }

    return result;
  }, [activeSessions, sessionSearch, sessionFilterStatus]);

  const sortedActiveSessions = useMemo(() => {
    return [...filteredActiveSessions].sort((a, b) => {
      let aVal = a[sessionSortField];
      let bVal = b[sessionSortField];

      if (aVal === null || aVal === undefined) return sessionSortDirection === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return sessionSortDirection === "asc" ? -1 : 1;

      if (typeof aVal === "string") {
        return sessionSortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sessionSortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredActiveSessions, sessionSortField, sessionSortDirection]);

  const paginatedActiveSessions = useMemo(() => {
    const startIndex = (sessionCurrentPage - 1) * sessionPageSize;
    return sortedActiveSessions.slice(startIndex, startIndex + sessionPageSize);
  }, [sortedActiveSessions, sessionCurrentPage, sessionPageSize]);

  const sessionTotalPages = useMemo(() => {
    return Math.ceil(sortedActiveSessions.length / sessionPageSize) || 1;
  }, [sortedActiveSessions.length, sessionPageSize]);

  useEffect(() => {
    if (sessionCurrentPage > sessionTotalPages) {
      setSessionCurrentPage(sessionTotalPages);
    }
  }, [sessionTotalPages, sessionCurrentPage]);

  // Admins filtering, sorting, pagination
  const filteredAdmins = useMemo(() => {
    let result = [...admins];

    // Search query
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase().trim();
      result = result.filter(admin => {
        const email = admin.email?.toLowerCase() || "";
        return email.includes(q);
      });
    }

    // Filter by Role
    if (adminFilterRole) {
      result = result.filter(admin => admin.role === adminFilterRole);
    }

    // Filter by Status
    if (adminFilterStatus) {
      const activeBool = adminFilterStatus === "active";
      result = result.filter(admin => admin.isActive === activeBool);
    }

    return result;
  }, [admins, adminSearch, adminFilterRole, adminFilterStatus]);

  const sortedAdmins = useMemo(() => {
    return [...filteredAdmins].sort((a, b) => {
      let aVal = a[adminSortField];
      let bVal = b[adminSortField];

      if (aVal === null || aVal === undefined) return adminSortDirection === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return adminSortDirection === "asc" ? -1 : 1;

      if (typeof aVal === "string") {
        return adminSortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return adminSortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredAdmins, adminSortField, adminSortDirection]);

  const paginatedAdmins = useMemo(() => {
    const startIndex = (adminCurrentPage - 1) * adminPageSize;
    return sortedAdmins.slice(startIndex, startIndex + adminPageSize);
  }, [sortedAdmins, adminCurrentPage, adminPageSize]);

  const adminTotalPages = useMemo(() => {
    return Math.ceil(sortedAdmins.length / adminPageSize) || 1;
  }, [sortedAdmins.length, adminPageSize]);

  useEffect(() => {
    if (adminCurrentPage > adminTotalPages) {
      setAdminCurrentPage(adminTotalPages);
    }
  }, [adminTotalPages, adminCurrentPage]);

  // RBAC Matrix resources filtering & sorting
  const filteredRbacResources = useMemo(() => {
    if (!matrixMetadata.resources) return [];
    let result = [...matrixMetadata.resources];

    if (rbacSearch.trim()) {
      const q = rbacSearch.toLowerCase().trim();
      result = result.filter(res => {
        return res.label?.toLowerCase().includes(q) || res.name?.toLowerCase().includes(q);
      });
    }

    return result;
  }, [matrixMetadata.resources, rbacSearch]);

  const sortedRbacResources = useMemo(() => {
    return [...filteredRbacResources].sort((a, b) => {
      let aVal = a.label || "";
      let bVal = b.label || "";

      return rbacSortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredRbacResources, rbacSortDirection]);

  const handleAuditSort = (field) => {
    if (auditSortField === field) {
      setAuditSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setAuditSortField(field);
      setAuditSortDirection("asc");
    }
  };

  // Generic sort icon renderer
  const renderSortIcon = (field, currentField, direction) => {
    if (currentField !== field) return <span className={styles.sortIconInactive}>⇅</span>;
    return direction === "asc" ? <span className={styles.sortIconActive}>▲</span> : <span className={styles.sortIconActive}>▼</span>;
  };

  const handleRbacSort = () => {
    setRbacSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const renderSkeleton = () => {
    return (
      <div className={styles.tableWrapper} style={{ border: "none", padding: 0 }}>
        <table className={styles.skeletonTable}>
          <thead className={styles.skeletonHeader}>
            <tr>
              <th className={styles.skeletonHeaderCell} style={{ width: "40px" }}><div className={styles.skeletonHeaderBox} style={{ width: "20px" }}></div></th>
              <th className={styles.skeletonHeaderCell} style={{ width: "50px" }}><div className={styles.skeletonHeaderBox} style={{ width: "20px" }}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
              <th className={styles.skeletonHeaderCell}><div className={styles.skeletonHeaderBox}></div></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr key={i} className={styles.skeletonRow}>
                <td className={styles.skeletonCell} style={{ textAlign: "center" }}><div className={styles.skeletonBox} style={{ width: "16px", height: "16px", margin: "auto" }}></div></td>
                <td className={styles.skeletonCell} style={{ textAlign: "center" }}><div className={styles.skeletonBox} style={{ width: "20px", margin: "auto" }}></div></td>
                <td className={styles.skeletonCell}><div className={`${styles.skeletonBox} ${styles.skeletonBoxLong}`}></div></td>
                <td className={styles.skeletonCell}><div className={styles.skeletonBox}></div></td>
                <td className={styles.skeletonCell}><div className={`${styles.skeletonBox} ${styles.skeletonBoxShort}`}></div></td>
                <td className={styles.skeletonCell}><div className={styles.skeletonBox}></div></td>
                <td className={styles.skeletonCell}><div className={styles.skeletonBox}></div></td>
                <td className={styles.skeletonCell}><div className={styles.skeletonBox}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get tab icon helper using Lucide components
  const getTabIcon = (id) => {
    switch (id) {
      case "dashboard": return <LayoutDashboard size={18} />;
      case "properti": return <Building2 size={18} />;
      case "testimonials": return <MessageSquare size={18} />;
      case "messages": return <Zap size={18} />;
      case "admins": return <Users size={18} />;
      case "sesi": return <Activity size={18} />;
      case "rbac": return <Key size={18} />;
      case "audit": return <History size={18} />;
      case "arsip": return <Trash2 size={18} />;
      case "docs": return <Info size={18} />;
      default: return <Building2 size={18} />;
    }
  };

  // Confirm and trigger logout API
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari sistem?",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => {
        window.location.href = "/api/auth/logout";
      }
    });
  };

  // Local Filter state (updates instantly)
  const [localFilters, setLocalFilters] = useState({
    search: "",
    kawasan: [],
    lebarMin: "",
    hadap: [],
    priceMax: "",
    tipe: "Semua",
    status: "Semua",
    siap: [],
    carport: "Semua",
  });

  // Applied Filter state (triggers search, debounced)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    kawasan: [],
    lebarMin: "",
    hadap: [],
    priceMax: "",
    tipe: "Semua",
    status: "Semua",
    siap: [],
    carport: "Semua",
  });

  // Dashboard global filters
  const [dashboardFilters, setDashboardFilters] = useState({ kawasan: "Semua", tipe: "Semua", startDate: "", endDate: "" });

  // Rehydration on mount
  useEffect(() => {
    setMounted(true);
    // Get role from cookie if exists
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const roleCookie = cookies.find((c) => c.startsWith("user_role="));
    if (roleCookie) {
      setRole(roleCookie.split("=")[1]);
    }

    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get("tab");
    if (queryTab && ["dashboard", "properti", "audit", "admins", "sessions", "matrix"].includes(queryTab)) {
      setActiveTab(queryTab);
    }

    const rehydrated = {
      search: params.get("search") || "",
      kawasan: params.get("kawasan") ? params.get("kawasan").split(",") : [],
      lebarMin: params.get("lebarMin") || "",
      hadap: params.get("hadap") ? params.get("hadap").split(",") : [],
      priceMax: params.get("priceMax") || "",
      tipe: params.get("tipe") || "Semua",
      status: params.get("status") || "Semua",
      siap: params.get("siap") ? params.get("siap").split(",") : [],
      carport: params.get("carport") || "Semua",
    };
    setLocalFilters(rehydrated);
    setAppliedFilters(rehydrated);
  }, []);

  // Fetch permissions matrix on mount or role change
  useEffect(() => {
    if (mounted) {
      if (role === "SUPERADMIN") {
        fetchPermissionsMatrix();
      } else {
        setPermissionsMatrix(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, mounted]);

  // Close column selector when clicking outside
  useEffect(() => {
    if (!showColumnSelector) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.columnSelectorContainer}`)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showColumnSelector]);

  // Sync activeTab to URL query parameters
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const currentTab = params.get("tab");
    if (currentTab !== activeTab) {
      params.set("tab", activeTab);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    }
  }, [activeTab, mounted]);

  // Live clock effect
  useEffect(() => {
    if (!mounted) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta"
      }) + " WIB");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Client-side debounce of 300ms for input changes
  useEffect(() => {
    if (!mounted) return;

    const handler = setTimeout(() => {
      setAppliedFilters(localFilters);
    }, 300);

    return () => clearTimeout(handler);
  }, [localFilters, mounted]);

  // Fetch properties when appliedFilters changes
  useEffect(() => {
    if (!mounted) return;

    // Sync URL search params
    const params = new URLSearchParams();
    if (appliedFilters.search) params.set("search", appliedFilters.search);
    if (appliedFilters.kawasan.length > 0) params.set("kawasan", appliedFilters.kawasan.join(","));
    if (appliedFilters.lebarMin) params.set("lebarMin", appliedFilters.lebarMin);
    if (appliedFilters.hadap.length > 0) params.set("hadap", appliedFilters.hadap.join(","));
    if (appliedFilters.priceMax) params.set("priceMax", appliedFilters.priceMax);
    if (appliedFilters.tipe !== "Semua") params.set("tipe", appliedFilters.tipe);
    if (appliedFilters.status !== "Semua") params.set("status", appliedFilters.status);
    if (appliedFilters.siap.length > 0) params.set("siap", appliedFilters.siap.join(","));
    if (appliedFilters.carport !== "Semua") params.set("carport", appliedFilters.carport);

    const queryStr = params.toString();
    const url = window.location.pathname + (queryStr ? `?${queryStr}` : "");
    window.history.replaceState({ path: url }, "", url);

    setCurrentPage(1);
    setSelectedIds([]);
    fetchProperties(queryStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, mounted, activeTab]);

  // Fetch audit logs when switching to audit tab or changing role
  useEffect(() => {
    if (mounted && (activeTab === "audit" || activeTab === "dashboard") && checkPermission(RESOURCES.AUDIT_LOGS, ACTIONS.READ)) {
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, mounted]);

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        headers: {
          "x-user-role": role,
        },
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setActiveSessions(data.sessions || []);
    } catch (e) {
      console.warn("Could not load active sessions:", e);
      addToast("Gagal memuat sesi aktif dari server.", true);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Fetch active sessions when switching to "sesi" tab
  useEffect(() => {
    if (mounted && (activeTab === "sesi" || activeTab === "dashboard") && checkPermission(RESOURCES.USERS, ACTIONS.MANAGE)) {
      fetchActiveSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, mounted]);

  // Fetch admin accounts
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/auth/users", {
        headers: {
          "x-user-role": role,
        },
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (e) {
      console.warn("Could not load admin users:", e);
      addToast("Gagal memuat daftar admin dari server.", true);
      // Fallback mock admins
      setAdmins([
        { id: "admin-mock-1", email: "admin1@primeproperty.com", role: "ADMIN", isActive: true, requiresPasswordReset: false, createdAt: new Date().toISOString() },
        { id: "admin-mock-2", email: "admin2@primeproperty.com", role: "ADMIN", isActive: false, requiresPasswordReset: true, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchAdminTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const res = await fetch("/api/testimonials?all=true", {
        headers: { "x-user-role": role },
      });
      const data = await res.json();
      setAdminTestimonials(data.testimonials || []);
    } catch (e) {
      addToast("Gagal memuat testimoni.", true);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const fetchAdminMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/contact", {
        headers: { "x-user-role": role },
      });
      const data = await res.json();
      setAdminMessages(data.submissions || []);
    } catch (e) {
      addToast("Gagal memuat pesan masuk.", true);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleToggleTestimonial = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) {
        addToast("Status testimoni berhasil diubah.");
        fetchAdminTestimonials();
      }
    } catch (e) {
      addToast("Gagal memperbarui testimoni.", true);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Testimoni",
      message: "Apakah Anda yakin ingin menghapus testimoni ini secara permanen?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/testimonials/${id}`, {
            method: "DELETE",
            headers: { "x-user-role": role },
          });
          if (res.ok) {
            addToast("Testimoni berhasil dihapus.");
            fetchAdminTestimonials();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        } catch (e) {
          addToast("Gagal menghapus testimoni.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Fetch when tab changes
  useEffect(() => {
    if (mounted && activeTab === "testimonials") fetchAdminTestimonials();
    if (mounted && activeTab === "messages") fetchAdminMessages();
  }, [activeTab, mounted, role]);

  // Fetch admins when switching to "admins" tab
  useEffect(() => {
    if (mounted && (activeTab === "admins" || activeTab === "dashboard") && checkPermission(RESOURCES.USERS, ACTIONS.MANAGE)) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, mounted]);

  // Fetch permissions matrix
  const fetchPermissionsMatrix = async () => {
    setMatrixLoading(true);
    try {
      const res = await fetch("/api/auth/roles", {
        headers: {
          "x-user-role": role,
        },
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setPermissionsMatrix(data.permissions || {});
      setMatrixMetadata(data.metadata || { resources: [], actions: [] });
    } catch (e) {
      console.warn("Could not load permissions matrix:", e);
      addToast("Gagal memuat matriks otorisasi dari server.", true);
      // Fallback matrix
      setPermissionsMatrix({
        SUPERADMIN: {
          properties: ["create", "read", "update", "delete"],
          users: ["manage", "read"],
          audit_logs: ["read"]
        },
        ADMIN: {
          properties: ["read"]
        }
      });
      setMatrixMetadata({
        resources: [
          { name: "properties", label: "Listing Properti" },
          { name: "users", label: "Manajemen Pengguna & Sesi" },
          { name: "audit_logs", label: "Log Audit Sistem" },
          { name: "testimonials", label: "Kelola Testimoni" },
          { name: "messages", label: "Pesan Kontak Masuk" }
        ],
        actions: [
          { name: "read", label: "View (Membaca)" },
          { name: "create", label: "Create (Menambah)" },
          { name: "update", label: "Update (Mengubah)" },
          { name: "delete", label: "Delete (Menghapus)" },
          { name: "manage", label: "Manage (Mengelola)" }
        ]
      });
    } finally {
      setMatrixLoading(false);
    }
  };

  // Fetch permissions matrix when switching to "rbac" tab
  useEffect(() => {
    if (mounted && activeTab === "rbac" && checkPermission(RESOURCES.USERS, ACTIONS.MANAGE)) {
      fetchPermissionsMatrix();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, mounted]);

  // Handle checkbox change in matrix
  const handleMatrixCheckboxChange = (targetRole, resourceName, actionName) => {
    setPermissionsMatrix((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      const rolePerms = copy[targetRole] || {};
      const currentActions = rolePerms[resourceName] || [];

      let newActions;
      if (currentActions.includes(actionName)) {
        // Remove action
        newActions = currentActions.filter((a) => a !== actionName);
      } else {
        // Add action
        newActions = [...currentActions, actionName];
      }

      copy[targetRole] = {
        ...rolePerms,
        [resourceName]: newActions
      };
      return copy;
    });
  };

  // Save matrix changes
  const handleSavePermissionsMatrix = async () => {
    if (!permissionsMatrix) return;
    
    // Safety check: superadmin must have users:manage
    if (permissionsMatrix.SUPERADMIN) {
      const superadminUsersActions = permissionsMatrix.SUPERADMIN.users || [];
      if (!superadminUsersActions.includes("manage")) {
        addToast("Error Keamanan: Superadmin wajib memiliki izin 'manage' pada 'users' agar Anda tidak mengunci diri Anda sendiri.", true);
        return;
      }
    }

    setMatrixSaving(true);
    try {
      const res = await fetch("/api/auth/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify({ permissions: permissionsMatrix }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Gagal menyimpan matriks otorisasi.", true);
        return;
      }

      addToast(data.message || "Matriks otorisasi berhasil diperbarui.");
      fetchPermissionsMatrix();
    } catch (e) {
      console.error(e);
      addToast("Terjadi kesalahan server saat menyimpan otorisasi.", true);
    } finally {
      setMatrixSaving(false);
    }
  };

  const handleAddNewRole = () => {
    if (!newRoleName.trim()) {
      addToast("Nama role tidak boleh kosong.", true);
      return;
    }
    
    const formattedRoleName = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
    
    if (permissionsMatrix[formattedRoleName]) {
      addToast(`Role "${formattedRoleName}" sudah ada.`, true);
      return;
    }
    
    setPermissionsMatrix(prev => ({
      ...prev,
      [formattedRoleName]: {} // Initialize with empty permissions
    }));
    setNewRoleName("");
    addToast(`Role "${formattedRoleName}" berhasil ditambahkan secara lokal. Jangan lupa klik "Simpan Perubahan".`);
  };

  const handleDeleteCustomRole = (roleToDelete) => {
    if (roleToDelete === "SUPERADMIN" || roleToDelete === "ADMIN") {
      addToast("Tidak dapat menghapus role sistem utama.", true);
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: "Hapus Role Kustom",
      message: `Apakah Anda yakin ingin menghapus role "${roleToDelete}"? Jika ada akun admin yang masih menggunakan role ini, penghapusan di server akan gagal.`,
      confirmText: "Ya, Hapus Role",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/auth/roles?role=${roleToDelete}`, {
            method: "DELETE",
            headers: { "x-user-role": role },
          });

          const data = await res.json();
          if (!res.ok) {
            addToast(data.error || "Gagal menghapus role.", true);
            return;
          }

          addToast(data.message || "Role berhasil dihapus.");
          fetchPermissionsMatrix();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error(e);
          addToast("Terjadi kesalahan server saat menghapus role.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Handle active session revocation
  const handleRevokeSession = async (sessionId, isCurrent) => {
    if (!checkPermission(RESOURCES.USERS, ACTIONS.MANAGE)) {
      addToast("Forbidden: Hanya Superadmin yang dapat mencabut akses sesi.", true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Cabut Akses",
      message: isCurrent 
        ? "Anda akan memutuskan sesi Anda sendiri saat ini dan dialihkan ke halaman login. Lanjutkan?"
        : "Apakah Anda yakin ingin memaksa logout perangkat ini?",
      confirmText: "Ya, Cabut Akses",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/sessions/${sessionId}`, {
            method: "DELETE",
            headers: {
              "x-user-role": role,
            },
          });

          const data = await res.json();
          if (!res.ok) {
            addToast(data.error || "Gagal mencabut akses sesi.", true);
            return;
          }

          addToast(data.message || "Akses sesi berhasil dicabut.");
          
          if (isCurrent) {
            window.location.href = "/agent/login";
          } else {
            fetchActiveSessions();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        } catch (e) {
          console.error(e);
          addToast("Terjadi kesalahan server saat mencabut sesi.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Toggle active status for admin
  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    const actionText = currentStatus ? "nonaktifkan" : "aktifkan";
    setConfirmModal({
      isOpen: true,
      title: "Ubah Status Admin",
      message: `Apakah Anda yakin ingin ${actionText} akun admin ini?`,
      confirmText: `Ya, ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      cancelText: "Batal",
      type: "warning",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/auth/users/${adminId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": role,
            },
            body: JSON.stringify({ isActive: !currentStatus }),
          });

          const data = await res.json();
          if (!res.ok) {
            addToast(data.error || `Gagal ${actionText} admin.`, true);
            return;
          }

          addToast(data.message || `Status admin berhasil diubah.`);
          fetchAdmins();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error(e);
          addToast("Terjadi kesalahan server saat memperbarui status admin.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Create/Edit admin account
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminFormErrors({});

    // Client-side validation
    const errors = {};
    if (!adminFormData.email) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminFormData.email)) {
      errors.email = "Format email tidak valid.";
    }
    
    // Password is only required in create mode
    if (adminFormMode === "create") {
      if (!adminFormData.password) {
        errors.password = "Password wajib diisi.";
      } else if (adminFormData.password.length < 8) {
        errors.password = "Password minimal harus 8 karakter.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const url = adminFormMode === "create" ? "/api/auth/users" : `/api/auth/users/${adminFormData.id}`;
      const method = adminFormMode === "create" ? "POST" : "PATCH";
      
      const payload = adminFormMode === "create" 
        ? { nama: adminFormData.nama, email: adminFormData.email, password: adminFormData.password, role: adminFormData.role }
        : { nama: adminFormData.nama, email: adminFormData.email, role: adminFormData.role, isActive: adminFormData.isActive };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || `Gagal ${adminFormMode === "create" ? "membuat" : "memperbarui"} akun admin.`, true);
        return;
      }

      addToast(data.message || `Akun admin berhasil ${adminFormMode === "create" ? "dibuat" : "diperbarui"}.`);
      setIsAdminFormOpen(false);
      setAdminFormData({ id: "", nama: "", email: "", password: "", role: "ADMIN", isActive: true });
      fetchAdmins();
    } catch (e) {
      console.error(e);
      addToast(`Terjadi kesalahan server saat ${adminFormMode === "create" ? "membuat" : "memperbarui"} admin.`, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal for admin
  const openEditFormForAdmin = (admin) => {
    setAdminFormMode("edit");
    setAdminFormData({
      id: admin.id,
      nama: admin.nama || "",
      email: admin.email,
      password: "", // password not editable in edit modal
      role: admin.role,
      isActive: admin.isActive
    });
    setAdminFormErrors({});
    setIsAdminFormOpen(true);
  };

  // Open delete confirmation modal for admin
  const openDeleteConfirmationForAdmin = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteAdminOpen(true);
  };

  // Delete admin API handler
  const handleDeleteAdminConfirm = async () => {
    if (!adminToDelete) return;
    try {
      const res = await fetch(`/api/auth/users/${adminToDelete.id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": role,
        }
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Gagal menghapus admin.", true);
        return;
      }
      addToast(data.message || "Akun admin berhasil dihapus.");
      setIsDeleteAdminOpen(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (e) {
      console.error(e);
      addToast("Terjadi kesalahan server saat menghapus admin.", true);
    }
  };

  // Reset admin password
  const handleResetAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetSuccessMessage("");
    if (!newAdminPassword) {
      addToast("Password baru wajib diisi.", true);
      return;
    }
    if (newAdminPassword.length < 8) {
      addToast("Password minimal harus 8 karakter.", true);
      return;
    }

    try {
      const res = await fetch(`/api/auth/users/${resetAdminId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify({ newPassword: newAdminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Gagal mereset password.", true);
        return;
      }

      setResetSuccessMessage(data.message || "Password admin berhasil direset.");
      addToast("Password admin berhasil direset.");
      setNewAdminPassword("");
      fetchAdmins();
    } catch (e) {
      console.error(e);
      addToast("Terjadi kesalahan server saat mereset password.", true);
    }
  };

  // Toast helper
  const addToast = (msg, isError = false) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Generate local mock properties if API/Database is down
  const getMockData = () => {
    const groups = ["Mentari", "Permai 123", "Project Ville", "Sinar Residence", "Golden Hill", null];
    const directions = [["UTARA"], ["SELATAN"], ["TIMUR"], ["BARAT"], ["TIMUR", "UTARA"], ["BARAT", "SELATAN"]];
    const siapOptions = ["siap_huni", "siap_kosong", "siap_huni_renovasi"];
    const units = ["Ready Siap huni", "Gate siap", "Lapangan", "Rucon", "Hook unit", null];
    
    const list = [];
    for (let i = 1; i <= 55; i++) {
      const isVilla = i % 2 === 0;
      const type = isVilla ? "VILLA" : "RUKO";
      const groupName = groups[i % groups.length];
      const kawasanVal = KAWASANS[i % KAWASANS.length];
      const lebar = isVilla ? (6 + (i % 5) * 0.5) : (4 + (i % 3) * 0.25);
      const panjang = isVilla ? (15 + (i % 4) * 2) : (12 + (i % 5) * 3);
      const hadap = directions[i % directions.length].sort();
      const tingkat = isVilla ? (1 + (i % 3) * 0.5) : (2 + (i % 3) * 1);
      const price = 800000000 + (i * 75000000);
      const carport = i % 3 !== 0;
      const status = i % 7 === 0 ? "sold_out" : "in_stock";
      const siap = siapOptions[i % siapOptions.length];
      const mapsLink = `https://google.com/maps/place/Prime+Property+Unit+${i}`;
      const unit = units[i % units.length];
      
      list.push({
        id: `mock-uuid-${i}`,
        namaProperti: isVilla 
          ? `Villa ${groupName || "Premium"} Indah Blok ${String.fromCharCode(65 + (i % 6))}-${i}`
          : `Ruko Commercial ${groupName || "Central"} Kav ${i}`,
        groupName,
        lebar,
        panjang,
        hadap,
        tipe: type,
        tingkat,
        price,
        carport,
        status,
        siap,
        mapsLink,
        kawasan: [kawasanVal],
        unit,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });
    }
    return list;
  };

  // Generate local mock audit logs
  const getMockLogs = () => {
    return [
      {
        id: "log-1",
        actionType: "UPDATE",
        entityName: "Property",
        entityId: "mock-uuid-1",
        changeSummary: 'Memperbarui properti "Ruko Commercial Central Kav 1". Perubahan: Harga: Rp 875.000.000 -> Rp 900.000.000',
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString(),
        user: { email: "superadmin@primeproperty.com", role: "SUPERADMIN" },
      },
      {
        id: "log-2",
        actionType: "CREATE",
        entityName: "Property",
        entityId: "mock-uuid-2",
        changeSummary: 'Membuat properti baru "Villa Mentari Indah Blok B-2" dengan harga Rp 1.500.000.000',
        ipAddress: "127.0.0.1",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: { email: "superadmin@primeproperty.com", role: "SUPERADMIN" },
      },
      {
        id: "log-3",
        actionType: "DELETE",
        entityName: "Property",
        entityId: "mock-uuid-7",
        changeSummary: 'Menghapus properti "Ruko Commercial Golden Hill Kav 7" (Soft Delete)',
        ipAddress: "127.0.0.1",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: { email: "superadmin@primeproperty.com", role: "SUPERADMIN" },
      },
    ];
  };

  // Fetch properties from database API or fallback
  const fetchProperties = async (queryStr = "") => {
    setLoading(true);
    try {
      let finalQueryStr = queryStr;
      if (activeTab === "arsip") {
        const params = new URLSearchParams(queryStr);
        params.set("showDeleted", "true");
        finalQueryStr = params.toString();
      }

      const res = await fetch(`/api/properties${finalQueryStr ? `?${finalQueryStr}` : ""}`, {
        headers: {
          "x-user-role": role,
        },
      });

      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }

      const data = await res.json();
      setProperties(data.properties || []);
      setIsUsingMock(false);
    } catch (e) {
      console.warn("Could not load from API. Falling back to client-side mock data: ", e);
      setIsUsingMock(true);
      // Client-side filtering simulation
      let filtered = getMockData();

      if (appliedFilters.search) {
        const search = appliedFilters.search.toLowerCase();
        filtered = filtered.filter((p) => {
          const nameMatch = p.namaProperti?.toLowerCase().includes(search);
          const groupMatch = p.groupName?.toLowerCase().includes(search);
          const kawasanMatch = p.kawasan?.some((k) => k.toLowerCase().includes(search));
          return nameMatch || groupMatch || kawasanMatch;
        });
      }

      if (appliedFilters.kawasan.length > 0) {
        const kawasans = appliedFilters.kawasan.map((k) => k.toLowerCase());
        filtered = filtered.filter((p) =>
          p.kawasan?.some((k) => kawasans.includes(k.toLowerCase()))
        );
      }

      if (appliedFilters.lebarMin) {
        const minW = parseFloat(appliedFilters.lebarMin);
        if (!isNaN(minW)) {
          filtered = filtered.filter((p) => p.lebar >= minW);
        }
      }

      if (appliedFilters.hadap.length > 0) {
        const hadaps = appliedFilters.hadap.map((h) => h.toLowerCase());
        filtered = filtered.filter((p) =>
          p.hadap?.some((h) => hadaps.includes(h.toLowerCase()))
        );
      }

      if (appliedFilters.priceMax) {
        const maxP = parseFloat(appliedFilters.priceMax);
        if (!isNaN(maxP)) {
          filtered = filtered.filter((p) => p.price <= maxP);
        }
      }

      if (appliedFilters.tipe !== "Semua") {
        filtered = filtered.filter((p) => p.tipe === appliedFilters.tipe.toUpperCase());
      }

      if (appliedFilters.status !== "Semua") {
        filtered = filtered.filter((p) => p.status === appliedFilters.status);
      }

      if (appliedFilters.siap.length > 0) {
        const siapOptions = appliedFilters.siap.map((s) => s.toLowerCase());
        filtered = filtered.filter((p) => siapOptions.includes(p.siap.toLowerCase()));
      }

      if (appliedFilters.carport !== "Semua") {
        const wantCar = appliedFilters.carport === "Ya";
        filtered = filtered.filter((p) => p.carport === wantCar);
      }

      setProperties(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs", {
        headers: {
          "x-user-role": role,
        },
      });
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (e) {
      console.warn("Could not load audit logs. Showing mock logs instead:", e);
      setAuditLogs(getMockLogs());
    }
  };

  // Helper to format currency
  const formatRupiah = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return "Rp " + Number(value).toLocaleString("id-ID");
  };

  // Handle active filter chip removal
  const handleRemoveChip = (key, value = null) => {
    setLocalFilters((prev) => {
      const copy = { ...prev };
      if (Array.isArray(copy[key])) {
        copy[key] = copy[key].filter((item) => item !== value);
      } else if (key === "tipe" || key === "status" || key === "carport") {
        copy[key] = "Semua";
      } else {
        copy[key] = "";
      }
      return copy;
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setLocalFilters({
      search: "",
      kawasan: [],
      lebarMin: "",
      hadap: [],
      priceMax: "",
      tipe: "Semua",
      status: "Semua",
      siap: [],
      carport: "Semua",
    });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      localFilters.search !== "" ||
      localFilters.kawasan.length > 0 ||
      localFilters.lebarMin !== "" ||
      localFilters.hadap.length > 0 ||
      localFilters.priceMax !== "" ||
      localFilters.tipe !== "Semua" ||
      localFilters.status !== "Semua" ||
      localFilters.siap.length > 0 ||
      localFilters.carport !== "Semua"
    );
  };

  // Handle form field change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Hadap form change (array)
  const handleFormHadapChange = (direction) => {
    setFormData((prev) => {
      const current = prev.hadap;
      const updated = current.includes(direction)
        ? current.filter((d) => d !== direction)
        : [...current, direction];
      return { ...prev, hadap: updated };
    });
  };

  // Kawasan form change (array)
  const handleFormKawasanChange = (kw) => {
    setFormData((prev) => {
      const current = prev.kawasan;
      const updated = current.includes(kw)
        ? current.filter((k) => k !== kw)
        : [...current, kw];
      return { ...prev, kawasan: updated };
    });
  };

  // Price typing input with formatted helper
  const handleFormPriceChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      price: val ? parseInt(val, 10) : "",
    }));
  };

  // Clean validation errors
  const validateForm = () => {
    const errors = {};
    
    // Step 1 validation
    if (!formData.namaProperti || formData.namaProperti.trim().length < 3 || formData.namaProperti.trim().length > 100) {
      errors.namaProperti = "Nama properti wajib diisi (3 - 100 karakter).";
    }
    const numPrice = parseInt(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = "Harga harus berupa angka lebih besar dari 0.";
    }
    if (formData.tipe !== "RUKO" && formData.tipe !== "VILLA") {
      errors.tipe = "Tipe properti harus Ruko atau Villa.";
    }
    
    // Step 2 validation
    const numLebar = parseFloat(formData.lebar);
    if (isNaN(numLebar) || numLebar <= 0) {
      errors.lebar = "Lebar harus berupa angka > 0.";
    }
    const numPanjang = parseFloat(formData.panjang);
    if (isNaN(numPanjang) || numPanjang <= 0) {
      errors.panjang = "Panjang harus berupa angka > 0.";
    }
    const numTingkat = parseFloat(formData.tingkat);
    if (isNaN(numTingkat) || numTingkat < 1 || numTingkat > 10) {
      errors.tingkat = "Tingkat harus antara 1 dan 10.";
    }
    if (!formData.hadap || formData.hadap.length === 0) {
      errors.hadap = "Pilih minimal satu arah hadap.";
    }

    // Step 3 validation
    if (!formData.kawasan || formData.kawasan.length === 0) {
      errors.kawasan = "Pilih minimal satu kawasan.";
    }
    if (formData.mapsLink && !formData.mapsLink.startsWith("http://") && !formData.mapsLink.startsWith("https://")) {
      errors.mapsLink = "Link Google Maps harus berupa URL valid (dimulai dengan http:// atau https://).";
    } else if (formData.mapsLink && !formData.mapsLink.includes("google.com/maps") && !formData.mapsLink.includes("maps.app.goo.gl")) {
      errors.mapsLink = "Link Google Maps harus berisi domain maps yang valid.";
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      // Determine which step has the error and switch to it
      if (errors.namaProperti || errors.price || errors.tipe) {
        setFormStep(1);
      } else if (errors.lebar || errors.panjang || errors.tingkat || errors.hadap) {
        setFormStep(2);
      } else {
        setFormStep(3);
      }
      return false;
    }
    
    return true;
  };

  // Step validation helper
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.namaProperti || formData.namaProperti.trim().length < 3 || formData.namaProperti.trim().length > 100) {
        errors.namaProperti = "Nama properti wajib diisi (3 - 100 karakter).";
      }
      const numPrice = parseInt(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        errors.price = "Harga harus berupa angka lebih besar dari 0.";
      }
      if (formData.tipe !== "RUKO" && formData.tipe !== "VILLA") {
        errors.tipe = "Tipe properti harus Ruko atau Villa.";
      }
    } else if (step === 2) {
      const numLebar = parseFloat(formData.lebar);
      if (isNaN(numLebar) || numLebar <= 0) {
        errors.lebar = "Lebar harus berupa angka > 0.";
      }
      const numPanjang = parseFloat(formData.panjang);
      if (isNaN(numPanjang) || numPanjang <= 0) {
        errors.panjang = "Panjang harus berupa angka > 0.";
      }
      const numTingkat = parseFloat(formData.tingkat);
      if (isNaN(numTingkat) || numTingkat < 1 || numTingkat > 10) {
        errors.tingkat = "Tingkat harus antara 1 dan 10.";
      }
      if (!formData.hadap || formData.hadap.length === 0) {
        errors.hadap = "Pilih minimal satu arah hadap.";
      }
    } else if (step === 3) {
      if (!formData.kawasan || formData.kawasan.length === 0) {
        errors.kawasan = "Pilih minimal satu kawasan.";
      }
      if (formData.mapsLink && !formData.mapsLink.startsWith("http://") && !formData.mapsLink.startsWith("https://")) {
        errors.mapsLink = "Link Google Maps harus berupa URL valid (dimulai dengan http:// atau https://).";
      } else if (formData.mapsLink && !formData.mapsLink.includes("google.com/maps") && !formData.mapsLink.includes("maps.app.goo.gl")) {
        errors.mapsLink = "Link Google Maps harus berisi domain maps yang valid.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stepper transition
  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep((prev) => prev + 1);
    } else {
      addToast("Silakan periksa inputan Anda sebelum melanjutkan.", true);
    }
  };

  // Submit create or edit form
  const handleFormSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (role !== "SUPERADMIN") {
      addToast("Forbidden: Hanya Superadmin yang dapat melakukan mutasi data.", true);
      return;
    }

    if (!validateForm()) {
      addToast("Formulir memiliki kesalahan. Silakan periksa kembali.", true);
      return;
    }

    setIsSubmitting(true);
    // Submit payload
    const payload = {
      ...formData,
      lebar: parseFloat(formData.lebar),
      panjang: parseFloat(formData.panjang),
      tingkat: parseFloat(formData.tingkat),
      price: parseInt(formData.price, 10),
    };

    if (isUsingMock) {
      // Handle mock changes in memory
      if (formMode === "create") {
        const newMock = {
          ...payload,
          id: `mock-uuid-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProperties((prev) => [newMock, ...prev]);
        setHighlightedId(newMock.id);
        addToast(`[MOCK] Sukses menambahkan properti "${payload.namaProperti}"`);
        
        if (addAnother) {
          setFormData(initialFormState);
          setFormStep(1);
          setFormErrors({});
        } else {
          setIsFormOpen(false);
        }
      } else {
        setProperties((prev) =>
          prev.map((p) => (p.id === selectedProperty.id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p))
        );
        setHighlightedId(selectedProperty.id);
        setSelectedProperty((prev) => ({
          ...prev,
          ...payload,
          updatedAt: new Date().toISOString(),
        }));
        addToast(`[MOCK] Sukses memperbarui properti "${payload.namaProperti}"`);
        setIsFormOpen(false);
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const url = formMode === "create" ? "/api/properties" : `/api/properties/${selectedProperty.id}`;
      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
          addToast("Validasi backend gagal.", true);
        } else {
          addToast(data.error || "Gagal menyimpan properti.", true);
        }
        setIsSubmitting(false);
        return;
      }

      addToast(data.message || "Properti berhasil disimpan.");
      
      if (data.property) {
        setHighlightedId(data.property.id);
      }

      if (addAnother && formMode === "create") {
        setFormData(initialFormState);
        setFormStep(1);
        setFormErrors({});
      } else {
        setIsFormOpen(false);
      }
      
      // Refresh properties
      fetchProperties();
      
      // If editing, update details view
      if (formMode === "edit" && data.property) {
        setSelectedProperty(data.property);
      }
    } catch (e) {
      console.error(e);
      addToast("Terjadi kesalahan koneksi server.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Form
  const openEditForm = () => {
    if (!selectedProperty) return;
    setFormMode("edit");
    setFormData({
      namaProperti: selectedProperty.namaProperti || "",
      groupName: selectedProperty.groupName || "",
      lebar: selectedProperty.lebar ? String(selectedProperty.lebar) : "",
      panjang: selectedProperty.panjang ? String(selectedProperty.panjang) : "",
      hadap: Array.isArray(selectedProperty.hadap) ? selectedProperty.hadap : [],
      tipe: selectedProperty.tipe || "RUKO",
      tingkat: selectedProperty.tingkat ? String(selectedProperty.tingkat) : "1.0",
      price: selectedProperty.price ? String(selectedProperty.price) : "",
      carport: !!selectedProperty.carport,
      status: selectedProperty.status || "in_stock",
      siap: selectedProperty.siap || "siap_huni",
      mapsLink: selectedProperty.mapsLink || "",
      kawasan: Array.isArray(selectedProperty.kawasan) ? selectedProperty.kawasan : [],
      unit: selectedProperty.unit || "",
    });
    setFormErrors({});
    setFormStep(1);
    setIsFormOpen(true);
  };

  // Bulk delete action handler
  const handleBulkDelete = async () => {
    if (role !== "SUPERADMIN") {
      addToast("Forbidden: Hanya Superadmin yang dapat menghapus data.", true);
      return;
    }

    if (selectedIds.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Hapus Massal Properti",
      message: `Yakin ingin menghapus massal ${selectedIds.length} properti terpilih? Data akan dipindahkan ke Arsip.`,
      confirmText: `Ya, Hapus ${selectedIds.length} Unit`,
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setIsSubmitting(true);
        if (isUsingMock) {
          setProperties((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
          addToast(`[MOCK] Berhasil menghapus massal ${selectedIds.length} properti.`);
          setSelectedIds([]);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsSubmitting(false);
          return;
        }

        try {
          const res = await fetch("/api/properties", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": role,
            },
            body: JSON.stringify({ ids: selectedIds }),
          });

          const data = await res.json();
          if (!res.ok) {
            addToast(data.error || "Gagal menghapus massal properti.", true);
            return;
          }

          addToast(data.message || "Properti berhasil dihapus massal.");
          setSelectedIds([]);
          fetchProperties();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error(e);
          addToast("Terjadi kesalahan server saat menghapus massal.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Import Excel action handler
  const handleExcelImportSubmit = async (e) => {
    e.preventDefault();
    setImportError("");
    setImportSuccess("");

    if (!csvFile) {
      setImportError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    setImportLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);

        if (parsed.length === 0) {
          setImportError("File Excel kosong atau tidak memiliki data.");
          setImportLoading(false);
          return;
        }

        // Map import columns from either English schema names or Indonesian human headers
        const formatted = parsed.map(item => {
          const namaProperti = item.namaProperti || item.Nama || "";
          const groupName = item.groupName || item.Group || null;
          
          let lebar = 0;
          if (item.lebar !== undefined) lebar = parseFloat(item.lebar);
          else if (item["Lebar (m)"] !== undefined) lebar = parseFloat(item["Lebar (m)"]);
          
          let panjang = 0;
          if (item.panjang !== undefined) panjang = parseFloat(item.panjang);
          else if (item["Panjang (m)"] !== undefined) panjang = parseFloat(item["Panjang (m)"]);

          const tipe = (item.tipe || item.Tipe || "RUKO").toString().toUpperCase();
          
          let tingkat = 1;
          if (item.tingkat !== undefined) tingkat = parseFloat(item.tingkat);
          else if (item.Tingkat !== undefined) tingkat = parseFloat(item.Tingkat);

          let price = 0;
          if (item.price !== undefined) price = parseInt(item.price);
          else if (item.Harga !== undefined) price = parseInt(item.Harga);
          else if (item.harga !== undefined) price = parseInt(item.harga);

          let carportRaw = item.carport;
          if (carportRaw === undefined) carportRaw = item.Carport;
          const carport = carportRaw === true || carportRaw === "true" || carportRaw === "Ya" || carportRaw === "1";

          let status = (item.status || item.Status || "in_stock").toString().toLowerCase().trim();
          if (status === "in stock" || status === "tersedia") status = "in_stock";
          if (status === "sold out" || status === "terjual") status = "sold_out";

          let siap = (item.siap || item.Kesiapan || "siap_huni").toString().toLowerCase().trim();
          if (siap === "siap huni") siap = "siap_huni";
          if (siap === "siap kosong") siap = "siap_kosong";
          if (siap === "siap huni renovasi" || siap === "siap huni renov") siap = "siap_huni_renovasi";

          let hadapRaw = item.hadap || item.Hadap || "";
          let hadap = [];
          if (Array.isArray(hadapRaw)) {
            hadap = hadapRaw;
          } else if (hadapRaw) {
            hadap = hadapRaw.toString().split(/[;,]/).map(h => h.trim().toUpperCase());
          }

          let kawasanRaw = item.kawasan || item.Kawasan || "";
          let kawasan = [];
          if (Array.isArray(kawasanRaw)) {
            kawasan = kawasanRaw;
          } else if (kawasanRaw) {
            kawasan = kawasanRaw.toString().split(/[;,]/).map(k => k.trim());
          }

          const unit = item.unit || item.Catatan || item["Informasi Unit (Catatan)"] || null;
          const mapsLink = item.mapsLink || item["Link Maps"] || item.mapslink || null;

          return {
            namaProperti: namaProperti.toString().trim(),
            groupName: groupName ? groupName.toString().trim() : null,
            lebar,
            panjang,
            hadap,
            tipe,
            tingkat,
            price,
            carport,
            status,
            siap,
            mapsLink: mapsLink ? mapsLink.toString().trim() : null,
            kawasan,
            unit: unit ? unit.toString().trim() : null
          };
        });

        // Filter out empty rows (without property name)
        const validFormatted = formatted.filter(p => p.namaProperti.length >= 3);
        
        if (validFormatted.length === 0) {
          setImportError("Tidak ada baris data properti yang valid (nama properti minimal 3 karakter).");
          setImportLoading(false);
          return;
        }

        if (isUsingMock) {
          const newMocks = validFormatted.map((p, idx) => ({
            ...p,
            id: `mock-uuid-${Date.now()}-${idx}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setProperties((prev) => [...newMocks, ...prev]);
          setImportSuccess(`[MOCK] Berhasil mengimpor ${newMocks.length} properti.`);
          addToast(`[MOCK] Berhasil mengimpor ${newMocks.length} properti.`);
          setCsvFile(null);
          setImportLoading(false);
          setTimeout(() => setIsImportOpen(false), 2000);
          return;
        }

        const res = await fetch("/api/properties/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": role,
          },
          body: JSON.stringify({ properties: validFormatted }),
        });

        const resData = await res.json();
        if (!res.ok) {
          setImportError(resData.error || "Gagal mengimpor properti.");
          setImportLoading(false);
          return;
        }

        setImportSuccess(resData.message || `Berhasil mengimpor ${validFormatted.length} properti.`);
        addToast(resData.message || `Berhasil mengimpor ${validFormatted.length} properti.`);
        setCsvFile(null);
        setImportLoading(false);
        fetchProperties();
        setTimeout(() => setIsImportOpen(false), 2000);
      } catch (err) {
        console.error("Excel import error:", err);
        setImportError("Terjadi kesalahan saat mengolah file Excel. Pastikan format file benar.");
        setImportLoading(false);
      }
    };
    reader.onerror = () => {
      setImportError("Gagal membaca file Excel.");
      setImportLoading(false);
    };
    reader.readAsArrayBuffer(csvFile);
  };

  // Download Excel template for import
  const handleDownloadTemplate = () => {
    const templateData = [{
      Nama: "Aston Villa Blok A",
      Group: "Mentari",
      "Lebar (m)": 6,
      "Panjang (m)": 15,
      Hadap: "UTARA;TIMUR",
      Tipe: "VILLA",
      Tingkat: 2,
      Harga: 1500000000,
      Carport: "Ya",
      Status: "In Stock",
      Kesiapan: "Siap Huni",
      Kawasan: "Krakatau;Helvetia",
      Catatan: "Hook unit, siap huni",
      "Link Maps": "https://google.com/maps/place/..."
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    worksheet["!cols"] = [
      { wch: 25 }, // Nama
      { wch: 15 }, // Group
      { wch: 10 }, // Lebar
      { wch: 10 }, // Panjang
      { wch: 15 }, // Hadap
      { wch: 10 }, // Tipe
      { wch: 10 }, // Tingkat
      { wch: 15 }, // Harga
      { wch: 10 }, // Carport
      { wch: 12 }, // Status
      { wch: 15 }, // Kesiapan
      { wch: 15 }, // Kawasan
      { wch: 20 }, // Catatan
      { wch: 30 }  // Link Maps
    ];
    XLSX.writeFile(workbook, "template_import_properti.xlsx");
    addToast("Template Excel berhasil diunduh.");
  };

  // Helper to open Edit Modal for specific property from the table listing directly
  const openEditFormForProperty = (p) => {
    setSelectedProperty(p);
    setFormMode("edit");
    setFormData({
      namaProperti: p.namaProperti || "",
      groupName: p.groupName || "",
      lebar: p.lebar ? String(p.lebar) : "",
      panjang: p.panjang ? String(p.panjang) : "",
      hadap: Array.isArray(p.hadap) ? p.hadap : [],
      tipe: p.tipe || "RUKO",
      tingkat: p.tingkat ? String(p.tingkat) : "1.0",
      price: p.price ? String(p.price) : "",
      carport: !!p.carport,
      status: p.status || "in_stock",
      siap: p.siap || "siap_huni",
      mapsLink: p.mapsLink || "",
      lat: p.lat || 3.5952,
      lng: p.lng || 98.6722,
      kawasan: Array.isArray(p.kawasan) ? p.kawasan : [],
      unit: p.unit || ""
    });
    setFormErrors({});
    setFormStep(1);
    setIsFormOpen(true);
  };



  // Open Create Form
  const openCreateForm = () => {
    setFormMode("create");
    setFormData(initialFormState);
    setFormErrors({});
    setFormStep(1);
    setIsFormOpen(true);
  };

  // Handle Deletion Confirmation
  const handleDeleteConfirm = async () => {
    if (role !== "SUPERADMIN") {
      addToast("Forbidden: Hanya Superadmin yang dapat menghapus data.", true);
      return;
    }

    setIsSubmitting(true);
    if (isUsingMock) {
      setProperties((prev) => prev.filter((p) => p.id !== selectedProperty.id));
      addToast(`[MOCK] Sukses menghapus properti "${selectedProperty.namaProperti}"`);
      // Add dummy audit log
      setAuditLogs((prev) => [
        {
          id: `log-mock-${Date.now()}`,
          actionType: "DELETE",
          entityName: "Property",
          entityId: selectedProperty.id,
          changeSummary: `Menghapus properti "${selectedProperty.namaProperti}" (Soft Delete)`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString(),
          user: { email: "superadmin@primeproperty.com", role: "SUPERADMIN" },
        },
        ...prev,
      ]);
      setSelectedProperty(null);
      setIsDeleteOpen(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": role,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Gagal menghapus properti.", true);
        setIsSubmitting(false);
        return;
      }

      addToast(data.message || "Properti berhasil dihapus.");
      setSelectedProperty(null);
      setIsDeleteOpen(false);
      fetchProperties();
    } catch (e) {
      console.error(e);
      addToast("Terjadi kesalahan koneksi server.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (propId, propName) => {
    if (role !== "SUPERADMIN") {
      addToast("Forbidden: Hanya Superadmin yang dapat memulihkan data.", true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Pulihkan Properti",
      message: `Apakah Anda yakin ingin memulihkan properti "${propName}" dari arsip ke database aktif?`,
      confirmText: "Ya, Pulihkan",
      cancelText: "Batal",
      type: "success",
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/properties/${propId}`, {
            method: "PATCH",
            headers: {
              "x-user-role": role,
            },
          });

          const data = await res.json();
          if (!res.ok) {
            addToast(data.error || "Gagal memulihkan properti.", true);
            return;
          }

          addToast(data.message || "Properti berhasil dipulihkan.");
          fetchProperties();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (e) {
          console.error(e);
          addToast("Terjadi kesalahan koneksi server.", true);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Check if a field is modified during Edit (Dirty state indicator)
  const isFieldDirty = (fieldName) => {
    if (formMode !== "edit" || !selectedProperty) return false;
    const origVal = selectedProperty[fieldName];
    const currVal = formData[fieldName];

    if (fieldName === "hadap" || fieldName === "kawasan") {
      const origArrStr = Array.isArray(origVal) ? [...origVal].sort().join(",") : "";
      const currArrStr = Array.isArray(currVal) ? [...currVal].sort().join(",") : "";
      return origArrStr !== currArrStr;
    }

    if (fieldName === "carport") {
      return !!origVal !== !!currVal;
    }

    if (!origVal && !currVal) return false;
    return String(origVal) !== String(currVal);
  };

  // Dashboard calculated states and helpers
  const filteredDashboardProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchKawasan =
        dashboardFilters.kawasan === "Semua" ||
        p.kawasan?.some((k) => k.toLowerCase() === dashboardFilters.kawasan.toLowerCase());
      const matchTipe =
        dashboardFilters.tipe === "Semua" ||
        p.tipe?.toUpperCase() === dashboardFilters.tipe.toUpperCase();
      
      let matchDate = true;
      if (p.createdAt) {
        const createdDate = new Date(p.createdAt);
        if (!isNaN(createdDate.getTime())) {
          if (dashboardFilters.startDate) {
            const start = new Date(dashboardFilters.startDate);
            start.setHours(0, 0, 0, 0);
            if (createdDate < start) matchDate = false;
          }
          if (dashboardFilters.endDate) {
            const end = new Date(dashboardFilters.endDate);
            end.setHours(23, 59, 59, 999);
            if (createdDate > end) matchDate = false;
          }
        } else if (dashboardFilters.startDate || dashboardFilters.endDate) {
          matchDate = false;
        }
      } else if (dashboardFilters.startDate || dashboardFilters.endDate) {
        matchDate = false;
      }
      return matchKawasan && matchTipe && matchDate;
    });
  }, [properties, dashboardFilters]);

  const totalInventoryValue = useMemo(() => {
    return filteredDashboardProperties
      .filter((p) => p.status === "in_stock")
      .reduce((sum, p) => sum + Number(p.price || 0), 0);
  }, [filteredDashboardProperties]);

  const averagePropertyPrice = useMemo(() => {
    if (filteredDashboardProperties.length === 0) return 0;
    const sum = filteredDashboardProperties.reduce((acc, p) => acc + Number(p.price || 0), 0);
    return Math.round(sum / filteredDashboardProperties.length);
  }, [filteredDashboardProperties]);

  const conversionRate = useMemo(() => {
    if (filteredDashboardProperties.length === 0) return 0;
    const sold = filteredDashboardProperties.filter((p) => p.status === "sold_out").length;
    return Math.round((sold / filteredDashboardProperties.length) * 100);
  }, [filteredDashboardProperties]);

  const inventoryVelocity = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return filteredDashboardProperties.filter((p) => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= thirtyDaysAgo;
    }).length;
  }, [filteredDashboardProperties]);

  const inStockCount = useMemo(() => {
    return filteredDashboardProperties.filter((p) => p.status === "in_stock").length;
  }, [filteredDashboardProperties]);

  const soldOutCount = useMemo(() => {
    return filteredDashboardProperties.filter((p) => p.status === "sold_out").length;
  }, [filteredDashboardProperties]);

  const priceDistribution = useMemo(() => {
    let band1 = 0; // < 1M
    let band2 = 0; // 1M-2M
    let band3 = 0; // 2M-5M
    let band4 = 0; // > 5M
    filteredDashboardProperties.forEach((p) => {
      const price = Number(p.price || 0);
      if (price < 1000000000) band1++;
      else if (price < 2000000000) band2++;
      else if (price <= 5000000000) band3++;
      else band4++;
    });
    return [band1, band2, band3, band4];
  }, [filteredDashboardProperties]);

  const geographicAssetDensity = useMemo(() => {
    return KAWASANS.map((kw) => {
      const sumValue = filteredDashboardProperties
        .filter((p) => p.kawasan?.some((k) => k.toLowerCase() === kw.toLowerCase()))
        .reduce((acc, p) => acc + Number(p.price || 0), 0);
      return { name: kw, value: sumValue };
    });
  }, [filteredDashboardProperties]);

  const systemActivityTrend = useMemo(() => {
    const dates = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dates.push(label);

      const count = auditLogs.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === d.toDateString();
      }).length;
      counts.push(count);
    }
    return { dates, counts };
  }, [auditLogs]);

  const healthIssues = useMemo(() => {
    const list = [];
    properties.forEach((p) => {
      const issues = [];
      if (!p.mapsLink || p.mapsLink.trim() === "") {
        issues.push("Link Google Maps kosong");
      }
      if (!p.price || Number(p.price) <= 0) {
        issues.push("Harga properti belum diatur");
      }
      if (!p.kawasan || p.kawasan.length === 0) {
        issues.push("Kawasan belum ditentukan");
      }
      if (!p.hadap || p.hadap.length === 0) {
        issues.push("Arah hadap belum diatur");
      }

      if (issues.length > 0) {
        list.push({
          property: p,
          issues: issues.join(", ")
        });
      }
    });
    return list.slice(0, 5);
  }, [properties]);

  const handleInspectProperty = (property) => {
    setActiveTab("properti");
    setSelectedProperty(property);
  };

  const handleExportExcel = () => {
    if (properties.length === 0) {
      addToast("Tidak ada data properti untuk diekspor.", true);
      return;
    }
    
    // Format properties data for Excel export
    const exportData = properties.map((p, index) => ({
      No: index + 1,
      Nama: p.namaProperti || "",
      Group: p.groupName || "-",
      "Lebar (m)": p.lebar || 0,
      "Panjang (m)": p.panjang || 0,
      Hadap: (p.hadap || []).join(", "),
      Tipe: p.tipe || "",
      Tingkat: p.tingkat || 1,
      Harga: p.price || 0,
      Carport: p.carport ? "Ya" : "Tidak",
      Status: p.status === "in_stock" ? "In Stock" : "Sold Out",
      Kesiapan: p.siap === "siap_huni" ? "Siap Huni" : p.siap === "siap_kosong" ? "Siap Kosong" : "Siap Huni Renovasi",
      Kawasan: (p.kawasan || []).join(", "),
      Catatan: p.unit || "-",
      "Link Maps": p.mapsLink || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Properti");
    
    // Set column widths for better Excel readability
    const max_widths = [
      { wch: 5 },   // No
      { wch: 25 },  // Nama
      { wch: 15 },  // Group
      { wch: 10 },  // Lebar
      { wch: 10 },  // Panjang
      { wch: 15 },  // Hadap
      { wch: 10 },  // Tipe
      { wch: 10 },  // Tingkat
      { wch: 15 },  // Harga
      { wch: 10 },  // Carport
      { wch: 12 },  // Status
      { wch: 15 },  // Kesiapan
      { wch: 15 },  // Kawasan
      { wch: 20 },  // Catatan
      { wch: 30 }   // Link Maps
    ];
    worksheet["!cols"] = max_widths;

    XLSX.writeFile(workbook, `prime_property_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    addToast("Ekspor Excel berhasil diunduh.");
  };


  // Memoized Chart Options to prevent reference changes and runMaskReveal runtime errors
  const donutChartOptions = useMemo(() => {
    return {
      chart: { 
        type: 'donut',
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: false
        }
      },
      labels: ['In Stock', 'Sold Out'],
      colors: ['#1b8a5a', '#b33a3a'],
      legend: { position: 'bottom' },
      dataLabels: {
        enabled: true,
        formatter: (val) => Math.round(val) + "%"
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => filteredDashboardProperties.length
              }
            }
          }
        }
      }
    };
  }, [filteredDashboardProperties.length]);

  const priceChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "50%",
          distributed: true
        }
      },
      colors: ["#1976d2", "#c9a961", "#e28743", "#b33a3a"],
      xaxis: {
        categories: ["< 1M", "1M - 2M", "2M - 5M", "> 5M"],
        labels: {
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      yaxis: {
        labels: {
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      grid: { borderColor: "#edf2f7" },
      legend: { show: false },
      dataLabels: {
        enabled: true,
        style: { fontSize: "11px", colors: ["#fff"] }
      }
    };
  }, []);

  const geographicChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: true
        }
      },
      colors: ["#c9a961", "#1976d2", "#1b8a5a", "#7b4fdb", "#e28743", "#2196f3", "#9c27b0"],
      xaxis: {
        categories: geographicAssetDensity.map((item) => item.name),
        labels: {
          formatter: (val) => {
            if (val >= 1000000000) return (val / 1000000000).toFixed(1) + " M";
            if (val >= 1000000) return (val / 1000000).toFixed(0) + " Jt";
            return val;
          },
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      yaxis: {
        labels: {
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      grid: { borderColor: "#edf2f7" },
      legend: { show: false },
      dataLabels: {
        enabled: true,
        formatter: (val) => {
          if (val >= 1000000000) return (val / 1000000000).toFixed(1) + "M";
          if (val >= 1000000) return (val / 1000000).toFixed(0) + "Jt";
          return val;
        },
        style: { fontSize: "11px", colors: ["#fff"] }
      }
    };
  }, [geographicAssetDensity]);

  const activityChartOptions = useMemo(() => {
    return {
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: false
        }
      },
      colors: ["#c9a961"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100]
        }
      },
      xaxis: {
        categories: systemActivityTrend.dates,
        labels: {
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      yaxis: {
        labels: {
          style: { colors: "#718096", fontSize: "11px", fontWeight: 600 }
        }
      },
      grid: { borderColor: "#edf2f7" }
    };
  }, [systemActivityTrend.dates]);

  const renderNavItem = (id) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item) return null;
    
    // Check permission
    const permitted = checkPermission(item.resource, item.action);
    if (!permitted) return null;
    
    const isActive = activeTab === id;
    
    return (
      <button
        key={id}
        className={`${styles.sidebarNavItem} ${isActive ? styles.navItemActive : ""} ${sidebarCollapsed ? styles.sidebarNavItemCollapsed : ""}`}
        onClick={() => {
          setActiveTab(id);
          setMobileOpen(false); // Close mobile menu when clicked
        }}
        title={sidebarCollapsed ? item.label : ""}
      >
        <span className={styles.navIcon} style={{ display: "flex", alignItems: "center" }}>
          {getTabIcon(id)}
        </span>
        {!sidebarCollapsed && (
          <span className={styles.navLabel} style={{ marginLeft: "10px" }}>{item.label}</span>
        )}
        {!sidebarCollapsed && id === "properti" && isUsingMock && (
          <span className={styles.mockBadge}>MOCK</span>
        )}
      </button>
    );
  };

  if (!mounted) return null;

  return (
    <div className={styles.dashboardLayout} data-lenis-prevent>
      {/* Toast Overlay */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.isError ? styles.toastError : ""}`}>
            <span style={{ display: "flex", alignItems: "center" }}>
              {t.isError ? <AlertTriangle size={18} /> : <Check size={18} />}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarBrand}>
          <a href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/logo.png" 
                alt="Prime Property Logo" 
                width={40} 
                height={40} 
                className={styles.logoImage}
              />
            </div>
            {!sidebarCollapsed && (
              <div className={styles.logoText}>
                <span className={styles.logoTextMain}>Prime</span>
                <span className={styles.logoTextSub}>- Property -</span>
              </div>
            )}
          </a>
        </div>

        {/* Sidebar Nav */}
        <nav className={styles.sidebarNav}>
          {/* Group 1: Dashboard & Analisis */}
          <div className={styles.navGroup}>
            {!sidebarCollapsed && <div className={styles.navGroupHeader}>DASHBOARD & ANALISIS</div>}
            {renderNavItem("dashboard")}
          </div>

          {/* Group 2: Modul Listing */}
          <div className={styles.navGroup}>
            {!sidebarCollapsed && <div className={styles.navGroupHeader}>MODUL LISTING</div>}
            {renderNavItem("properti")}
            {renderNavItem("arsip")}
          </div>

          {/* Group 3: Feedback & Komunikasi */}
          <div className={styles.navGroup}>
            {!sidebarCollapsed && <div className={styles.navGroupHeader}>FEEDBACK & KOMUNIKASI</div>}
            {renderNavItem("testimonials")}
            {renderNavItem("messages")}
          </div>

          {/* Group 3: Keamanan & Otorisasi */}
          {(checkPermission(RESOURCES.USERS, ACTIONS.MANAGE) || checkPermission(RESOURCES.AUDIT_LOGS, ACTIONS.READ)) && (
            <div className={styles.navGroup}>
              {!sidebarCollapsed && <div className={styles.navGroupHeader}>KEAMANAN & OTORISASI</div>}
              {renderNavItem("admins")}
              {renderNavItem("sesi")}
              {renderNavItem("rbac")}
              {renderNavItem("audit")}
              {renderNavItem("docs")}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {!sidebarCollapsed ? (
            <>
              <div className={styles.userProfile}>
                <div className={styles.avatar}>
                  <Shield size={18} color="#c9a961" />
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userEmail}>
                    {role === "SUPERADMIN" ? "superadmin@primeproperty.com" : "admin@primeproperty.com"}
                  </div>
                  <div className={styles.userRoleBadge}>{role}</div>
                </div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={14} style={{ marginRight: "6px" }} /> Keluar / Logout
              </button>
            </>
          ) : (
            <div className={styles.collapsedFooter}>
              <button 
                className={styles.collapsedLogoutBtn} 
                onClick={handleLogout}
                title="Keluar / Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Right Content Area */}
      <div className={styles.contentArea}>
        {/* Top Header inside content area */}
        <header className={styles.contentHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              className={styles.mobileMenuToggle} 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
            >
              ☰
            </button>
            <button 
              className={styles.desktopSidebarToggle} 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            
            <div className={styles.headerWelcome}>
              <span className={styles.welcomeText}>Selamat datang kembali, <strong>{role === "SUPERADMIN" ? "Superadmin" : "Admin"}</strong></span>
            </div>
          </div>
          
          <div className={styles.headerTime}>
            <Clock size={14} style={{ marginRight: "6px" }} /> {currentDateTime}
          </div>
        </header>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {/* Tab 1: Properties List */}
          {activeTab === "properti" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Database Properti</h1>
              <div style={{ display: "flex", gap: "10px" }}>
                {checkPermission(RESOURCES.PROPERTIES, ACTIONS.CREATE) && (
                  <>
                    <button className={styles.addBtn} onClick={openCreateForm}>
                     <Plus size={16} style={{ marginRight: "6px" }} /> Tambah Properti
                    </button>
                    <button className={`${styles.addBtn} ${styles.importBtn}`} onClick={() => setIsImportOpen(true)}>
                     <FileUp size={16} style={{ marginRight: "6px" }} /> Import Excel
                    </button>
                    </>
                    )}
                    <button className={`${styles.addBtn} ${styles.exportBtn}`} onClick={handleExportExcel}>
                    <Download size={16} style={{ marginRight: "6px" }} /> Ekspor Excel
                    </button>              </div>
            </div>


            {/* Filter Card */}
            <div className={styles.filterCard}>
              <div className={styles.searchBar} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama properti, group, atau kawasan..."
                    className={styles.searchInput}
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                    style={{ paddingRight: "40px" }}
                  />
                  <Search size={18} color="#cbd5e0" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                {/* Column Selector */}
                <div className={styles.columnSelectorContainer} style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`${styles.filterToggleBtn} ${showColumnSelector ? styles.filterToggleBtnActive : ""}`}
                    onClick={() => {
                      setShowColumnSelector(!showColumnSelector);
                      setShowFilters(false); // Close filters when opening column selector
                    }}
                    title="Pilih kolom yang akan ditampilkan"
                  >
                    <SlidersHorizontal size={16} style={{ marginRight: "6px" }} />
                    Pilih Kolom
                  </button>
                  
                  {showColumnSelector && (
                    <div className={styles.columnSelectorMenu}>
                      <div className={styles.columnSelectorHeader}>Tampilkan Kolom</div>
                      <div className={styles.columnSelectorOptions}>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.groupName}
                            onChange={() => setVisibleColumns({ ...visibleColumns, groupName: !visibleColumns.groupName })}
                          />
                          <span>Group</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.dimensi}
                            onChange={() => setVisibleColumns({ ...visibleColumns, dimensi: !visibleColumns.dimensi })}
                          />
                          <span>Dimensi</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.hadap}
                            onChange={() => setVisibleColumns({ ...visibleColumns, hadap: !visibleColumns.hadap })}
                          />
                          <span>Hadap</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.tipe}
                            onChange={() => setVisibleColumns({ ...visibleColumns, tipe: !visibleColumns.tipe })}
                          />
                          <span>Tipe</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.tingkat}
                            onChange={() => setVisibleColumns({ ...visibleColumns, tingkat: !visibleColumns.tingkat })}
                          />
                          <span>Tingkat</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.price}
                            onChange={() => setVisibleColumns({ ...visibleColumns, price: !visibleColumns.price })}
                          />
                          <span>Harga</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.carport}
                            onChange={() => setVisibleColumns({ ...visibleColumns, carport: !visibleColumns.carport })}
                          />
                          <span>Carport</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.status}
                            onChange={() => setVisibleColumns({ ...visibleColumns, status: !visibleColumns.status })}
                          />
                          <span>Status</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.siap}
                            onChange={() => setVisibleColumns({ ...visibleColumns, siap: !visibleColumns.siap })}
                          />
                          <span>Kesiapan</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.kawasan}
                            onChange={() => setVisibleColumns({ ...visibleColumns, kawasan: !visibleColumns.kawasan })}
                          />
                          <span>Kawasan</span>
                        </label>
                        <label className={styles.columnSelectorOptionItem}>
                          <input
                            type="checkbox"
                            className={styles.customTableCheckbox}
                            checked={visibleColumns.createdAt}
                            onChange={() => setVisibleColumns({ ...visibleColumns, createdAt: !visibleColumns.createdAt })}
                          />
                          <span>Tanggal Dibuat</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.filterToggleBtn} ${showFilters ? styles.filterToggleBtnActive : ""}`}
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowColumnSelector(false); // Close columns when opening filters
                  }}
                  title={showFilters ? "Sembunyikan Filter Lanjutan" : "Tampilkan Filter Lanjutan"}
                >
                  <Filter size={16} style={{ marginRight: "6px" }} />
                  {showFilters ? "Sembunyikan Filter" : "Filter Lanjutan"}
                </button>
              </div>

              {showFilters && (
                <div className={styles.filterGrid} style={{ marginTop: "20px", borderTop: "1px solid #edf2f7", paddingTop: "20px" }}>
                {/* Kawasan Multi Select */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Kawasan</label>
                  <MultiSelectDropdown
                    options={KAWASANS.map((kw) => ({ value: kw, label: kw }))}
                    selectedValues={localFilters.kawasan}
                    onChange={(updated) => setLocalFilters({ ...localFilters, kawasan: updated })}
                    placeholder="Semua Kawasan"
                  />
                </div>

                {/* Hadap Multi Select */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Hadap</label>
                  <MultiSelectDropdown
                    options={HADAPS.map((hd) => ({ value: hd, label: hd }))}
                    selectedValues={localFilters.hadap}
                    onChange={(updated) => setLocalFilters({ ...localFilters, hadap: updated })}
                    placeholder="Semua Hadap"
                  />
                </div>

                {/* Siap Multi-select */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Kesiapan Unit</label>
                  <MultiSelectDropdown
                    options={SIAPS.map((s) => ({ value: s.value, label: s.label }))}
                    selectedValues={localFilters.siap}
                    onChange={(updated) => setLocalFilters({ ...localFilters, siap: updated })}
                    placeholder="Semua Kesiapan"
                  />
                </div>


                {/* Tipe Radio */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Tipe Properti</label>
                  <div className={styles.radioGroup}>
                    {["Semua", "Ruko", "Villa"].map((t) => (
                      <label key={t} className={styles.radioOption}>
                        <input
                          type="radio"
                          name="tipeFilter"
                          checked={localFilters.tipe === t}
                          onChange={() => setLocalFilters({ ...localFilters, tipe: t })}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Radio */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Status</label>
                  <div className={styles.radioGroup}>
                    {[
                      { value: "Semua", label: "Semua" },
                      { value: "in_stock", label: "In Stock" },
                      { value: "sold_out", label: "Sold Out" },
                    ].map((st) => (
                      <label key={st.value} className={styles.radioOption}>
                        <input
                          type="radio"
                          name="statusFilter"
                          checked={localFilters.status === st.value}
                          onChange={() => setLocalFilters({ ...localFilters, status: st.value })}
                        />
                        {st.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Carport Toggle Group */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Carport</label>
                  <div className={styles.toggleGroup}>
                    {["Semua", "Ya", "Tidak"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.toggleBtn} ${localFilters.carport === c ? styles.toggleBtnActive : ""}`}
                        onClick={() => setLocalFilters({ ...localFilters, carport: c })}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numeric Inputs */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Lebar Minimum (m)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 5"
                    className={styles.filterInput}
                    value={localFilters.lebarMin}
                    onChange={(e) => setLocalFilters({ ...localFilters, lebarMin: e.target.value })}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Harga Maksimum (Rupiah)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 2000000000"
                    className={styles.filterInput}
                    value={localFilters.priceMax}
                    onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
                  />
                  {localFilters.priceMax && (
                    <span style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                      {formatRupiah(localFilters.priceMax)}
                    </span>
                  )}
                </div>
              </div>
            )}

              {/* Active Filter Chips */}
              {hasActiveFilters() && (
                <div className={styles.activeChipsRow}>
                  <span className={styles.chipsLabel}>Filter Aktif:</span>
                  
                  {localFilters.search && (
                    <div className={styles.chip}>
                      Kata kunci: &ldquo;{localFilters.search}&rdquo;
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("search")}>×</button>
                    </div>
                  )}

                  {localFilters.kawasan.map((kw) => (
                    <div key={kw} className={styles.chip}>
                      Kawasan: {kw}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("kawasan", kw)}>×</button>
                    </div>
                  ))}

                  {localFilters.lebarMin && (
                    <div className={styles.chip}>
                      Lebar ≥ {localFilters.lebarMin} m
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("lebarMin")}>×</button>
                    </div>
                  )}

                  {localFilters.hadap.map((hd) => (
                    <div key={hd} className={styles.chip}>
                      Hadap: {hd}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("hadap", hd)}>×</button>
                    </div>
                  ))}

                  {localFilters.priceMax && (
                    <div className={styles.chip}>
                      Harga ≤ {formatRupiah(localFilters.priceMax)}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("priceMax")}>×</button>
                    </div>
                  )}

                  {localFilters.tipe !== "Semua" && (
                    <div className={styles.chip}>
                      Tipe: {localFilters.tipe}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("tipe")}>×</button>
                    </div>
                  )}

                  {localFilters.status !== "Semua" && (
                    <div className={styles.chip}>
                      Status: {localFilters.status === "in_stock" ? "In Stock" : "Sold Out"}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("status")}>×</button>
                    </div>
                  )}

                  {localFilters.siap.map((s) => {
                    const found = SIAPS.find((opt) => opt.value === s);
                    return (
                      <div key={s} className={styles.chip}>
                        Kesiapan: {found ? found.label : s}
                        <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("siap", s)}>×</button>
                      </div>
                    );
                  })}

                  {localFilters.carport !== "Semua" && (
                    <div className={styles.chip}>
                      Carport: {localFilters.carport}
                      <button className={styles.removeChipBtn} onClick={() => handleRemoveChip("carport")}>×</button>
                    </div>
                  )}

                  <button className={styles.resetBtn} onClick={handleResetFilters}>
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
              <div className={styles.bulkToolbar}>
                <div className={styles.bulkInfo}>
                  Terpilih: <strong style={{ color: "#c9a961" }}>{selectedIds.length}</strong> properti
                </div>
                <div className={styles.bulkActions}>
                  <button className={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
                    <Trash2 size={14} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} /> Hapus Terpilih ({selectedIds.length})
                  </button>
                  <button className={styles.btnCancel} style={{ padding: "6px 12px", fontSize: "12px", marginLeft: "10px" }} onClick={() => setSelectedIds([])}>
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Table and Side Panel Layout */}
            <div className={styles.tableContainer}>
              {loading ? (
                renderSkeleton()
              ) : properties.length === 0 ? (
                <div className={styles.tableWrapper}>
                  <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    Tidak ada properti yang cocok dengan kriteria filter.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div className={styles.customTableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th className={styles.stickyHeaderCheckbox} style={{ width: "40px", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              className={styles.customTableCheckbox}
                              checked={isAllPageSelected}
                              onChange={handleSelectAllPage}
                            />
                          </th>
                          <th className={styles.stickyHeaderNo} style={{ width: "50px", textAlign: "center" }}>No</th>
                          <th onClick={() => handleSort("namaProperti")} className={`${styles.sortHeader} ${styles.stickyHeaderNama}`}>
                            Nama {renderSortIcon("namaProperti", sortField, sortDirection)}
                          </th>
                           {visibleColumns.groupName && (
                             <th onClick={() => handleSort("groupName")} className={styles.sortHeader}>
                               Group {renderSortIcon("groupName", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.dimensi && (
                             <th style={{ width: "130px" }}>Lebar × Panjang</th>
                           )}
                           {visibleColumns.hadap && (
                             <th style={{ width: "120px" }}>Hadap</th>
                           )}
                           {visibleColumns.tipe && (
                             <th onClick={() => handleSort("tipe")} className={styles.sortHeader} style={{ width: "100px" }}>
                               Tipe {renderSortIcon("tipe", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.tingkat && (
                             <th onClick={() => handleSort("tingkat")} className={styles.sortHeader} style={{ width: "90px" }}>
                               Tingkat {renderSortIcon("tingkat", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.price && (
                             <th onClick={() => handleSort("price")} className={styles.sortHeader} style={{ width: "150px" }}>
                               Harga {renderSortIcon("price", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.carport && (
                             <th style={{ width: "90px", textAlign: "center" }}>Carport</th>
                           )}
                           {visibleColumns.status && (
                             <th onClick={() => handleSort("status")} className={styles.sortHeader} style={{ width: "120px" }}>
                               Status {renderSortIcon("status", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.siap && (
                             <th onClick={() => handleSort("siap")} className={styles.sortHeader} style={{ width: "160px" }}>
                               Kesiapan {renderSortIcon("siap", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.kawasan && (
                             <th onClick={() => handleSort("kawasan")} className={styles.sortHeader}>
                               Kawasan {renderSortIcon("kawasan", sortField, sortDirection)}
                             </th>
                           )}
                           {visibleColumns.createdAt && (
                             <th onClick={() => handleSort("createdAt")} className={styles.sortHeader} style={{ width: "130px" }}>
                               Tanggal Dibuat {renderSortIcon("createdAt", sortField, sortDirection)}
                             </th>
                           )}
                           <th style={{ width: "120px", textAlign: "center" }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProperties.map((p, idx) => {
                          const isSelected = selectedIds.includes(p.id);
                          const rowNum = (currentPage - 1) * pageSize + idx + 1;
                          
                          return (
                            <tr 
                              key={p.id}
                              className={`${styles.customTableRow} ${isSelected ? styles.customTableRowSelected : ""} ${highlightedId === p.id ? styles.rowHighlighted : ""}`}
                              onClick={() => setSelectedProperty(p)}
                              style={{ cursor: "pointer" }}
                            >
                              <td 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectItem(p.id);
                                }}
                                className={styles.stickyColCheckbox}
                                style={{ textAlign: "center" }}
                              >
                                <input
                                  type="checkbox"
                                  className={styles.customTableCheckbox}
                                  checked={isSelected}
                                  onChange={() => {}}
                                />
                              </td>
                              <td className={styles.stickyColNo} style={{ textAlign: "center", color: "#888", fontSize: "11px" }}>{rowNum}</td>
                              <td className={styles.stickyColNama} style={{ fontWeight: "700" }}>{p.namaProperti}</td>
                              {visibleColumns.groupName && <td>{p.groupName || "-"}</td>}
                              {visibleColumns.dimensi && <td>{`${p.lebar} × ${p.panjang} m`}</td>}
                              {visibleColumns.hadap && <td>{p.hadap?.join(", ") || "-"}</td>}
                              {visibleColumns.tipe && <td>{p.tipe}</td>}
                              {visibleColumns.tingkat && <td>{p.tingkat}</td>}
                              {visibleColumns.price && <td style={{ fontWeight: "700", color: "#c9a961" }}>{formatRupiah(p.price)}</td>}
                              {visibleColumns.carport && (
                                <td style={{ textAlign: "center" }}>
                                  {p.carport 
                                    ? <span style={{ color: "#1b8a5a", fontWeight: "bold", fontSize: "16px" }}>✔</span> 
                                    : <span style={{ color: "#b33a3a", fontWeight: "bold", fontSize: "16px" }}>✘</span>
                                  }
                                </td>
                              )}
                              {visibleColumns.status && (
                                <td>
                                  <span className={`${styles.badge} ${p.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut}`}>
                                    {p.status === "in_stock" ? "In Stock" : "Sold Out"}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.siap && (
                                <td>
                                  <span className={`${styles.badge} ${
                                    p.siap === "siap_huni" 
                                      ? styles.badgeSiapHuni 
                                      : p.siap === "siap_kosong" 
                                        ? styles.badgeSiapKosong 
                                        : styles.badgeSiapRenov
                                    }`}>
                                    {p.siap === "siap_huni" ? "Siap Huni" : p.siap === "siap_kosong" ? "Siap Kosong" : "Siap Huni Renovasi"}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.kawasan && <td>{p.kawasan?.join(", ") || "-"}</td>}
                              {visibleColumns.createdAt && (
                                <td style={{ fontSize: "12px", color: "#666" }}>
                                  {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </td>
                              )}
                              <td style={{ textAlign: "center" }}>
                                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                    <button
                                      type="button"
                                      className={`${styles.tableActionBtn} ${styles.tableActionBtnDetail}`}
                                      title="Lihat Detail Properti"
                                      onClick={(e) => {
                                        console.log("==> Detail button clicked for property:", p);
                                        e.stopPropagation();
                                        setSelectedProperty(p);
                                      }}
                                    >
                                      <Eye size={14} />
                                    </button>
                                    {checkPermission(RESOURCES.PROPERTIES, ACTIONS.UPDATE) && (
                                      <button
                                        className={`${styles.tableActionBtn} ${styles.tableActionBtnEdit}`}
                                        title="Edit Properti"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditFormForProperty(p);
                                        }}
                                      >
                                        <Pencil size={14} />
                                      </button>
                                    )}
                                    {checkPermission(RESOURCES.PROPERTIES, ACTIONS.DELETE) && (
                                      <button
                                        className={`${styles.tableActionBtn} ${styles.tableActionBtnDelete}`}
                                        title="Hapus Properti"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProperty(p);
                                          setIsDeleteOpen(true);
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className={styles.customTablePagination}>
                    <div className={styles.paginationInfo}>
                      Menampilkan <strong>{Math.min((currentPage - 1) * pageSize + 1, sortedProperties.length)}</strong> - <strong>{Math.min(currentPage * pageSize, sortedProperties.length)}</strong> dari <strong>{sortedProperties.length}</strong> properti
                    </div>
                    
                    <div className={styles.paginationControls}>
                      <div className={styles.pageSizeSelectWrapper}>
                        <span>Tampilkan:</span>
                        <select
                          className={styles.paginationPageSizeSelect}
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          {[25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className={styles.paginationPages}>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          title="Halaman Pertama"
                        >
                          «
                        </button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          title="Sebelumnya"
                        >
                          ‹
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                          .filter(page => {
                            return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                          })
                          .map((page, idx, arr) => {
                            const isPrevPageDotted = idx > 0 && page - arr[idx - 1] > 1;
                            return (
                              <span key={page} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {isPrevPageDotted && <span className={styles.paginationEllipsis}>...</span>}
                                <button
                                  type="button"
                                  className={`${styles.paginationBtn} ${currentPage === page ? styles.paginationBtnActive : ""}`}
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </button>
                              </span>
                            );
                          })}
                        
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          title="Berikutnya"
                        >
                          ›
                        </button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          title="Halaman Terakhir"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side Drawer Panel */}
              {selectedProperty && (
                <div className={styles.drawer}>
                  <div className={styles.drawerHeader}>
                    <h3 className={styles.drawerTitle}>Detail Properti</h3>
                    <div className={styles.drawerActions}>
                      {checkPermission(RESOURCES.PROPERTIES, ACTIONS.UPDATE) && (
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                          title="Edit Properti"
                          onClick={openEditForm}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {checkPermission(RESOURCES.PROPERTIES, ACTIONS.DELETE) && (
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                          title="Hapus Properti"
                          onClick={() => setIsDeleteOpen(true)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        className={styles.iconBtn}
                        title="Tutup Panel"
                        onClick={() => setSelectedProperty(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.drawerContent}>
                    {/* Section 1: Ringkasan Utama */}
                    <div className={styles.drawerGroup}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1a1a" }}>
                        {selectedProperty.namaProperti}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        Group: {selectedProperty.groupName || "Tidak ada group"}
                      </div>
                    </div>

                    {/* Section 2: Dimensi & Tipe */}
                    <div className={styles.drawerGroup}>
                      <h4 className={styles.drawerSectionTitle}>Spesifikasi Fisik</h4>
                      <div className={styles.grid2}>
                        <div>
                          <div className={styles.fieldLabel}>Dimensi</div>
                          <div className={styles.fieldVal}>
                            {selectedProperty.lebar} x {selectedProperty.panjang} meter
                          </div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Hadap</div>
                          <div className={styles.tagContainer}>
                            {selectedProperty.hadap?.map((h) => (
                              <span key={h} className={styles.tag}>{h}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Tipe Properti</div>
                          <div className={styles.fieldVal}>{selectedProperty.tipe}</div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Jumlah Tingkat</div>
                          <div className={styles.fieldVal}>{selectedProperty.tingkat} Lantai</div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Carport</div>
                          <div className={styles.fieldVal}>{selectedProperty.carport ? "Tersedia" : "Tidak ada"}</div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Unit (Info)</div>
                          <div className={styles.fieldVal}>{selectedProperty.unit || "-"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Status & Finansial */}
                    <div className={styles.drawerGroup}>
                      <h4 className={styles.drawerSectionTitle}>Status & Harga</h4>
                      <div className={styles.grid2}>
                        <div>
                          <div className={styles.fieldLabel}>Harga Jual</div>
                          <div className={styles.fieldVal} style={{ color: "#c9a961", fontSize: "15px" }}>
                            {formatRupiah(selectedProperty.price)}
                          </div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Status Inventory</div>
                          <div style={{ marginTop: "4px" }}>
                            <span
                              className={`${styles.badge} ${
                                selectedProperty.status === "in_stock" ? styles.badgeInStock : styles.badgeSoldOut
                              }`}
                            >
                              {selectedProperty.status === "in_stock" ? "In Stock" : "Sold Out"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Kesiapan Unit</div>
                          <div style={{ marginTop: "4px" }}>
                            <span
                              className={`${styles.badge} ${
                                selectedProperty.siap === "siap_huni"
                                  ? styles.badgeSiapHuni
                                  : selectedProperty.siap === "siap_kosong"
                                  ? styles.badgeSiapKosong
                                  : styles.badgeSiapRenov
                              }`}
                            >
                              {selectedProperty.siap === "siap_huni"
                                ? "Siap Huni"
                                : selectedProperty.siap === "siap_kosong"
                                ? "Siap Kosong"
                                : "Siap Huni Renovasi"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Kawasan</div>
                          <div className={styles.tagContainer}>
                            {selectedProperty.kawasan?.map((k) => (
                              <span key={k} className={styles.tag} style={{ backgroundColor: "#e8effa", color: "#1976d2" }}>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Lokasi & Audit */}
                    <div className={styles.drawerGroup}>
                      <h4 className={styles.drawerSectionTitle}>Lokasi & Informasi Tambahan</h4>
                      {selectedProperty.mapsLink ? (
                        <a
                          href={selectedProperty.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.mapsBtn}
                        >
                          Buka di Google Maps
                        </a>
                      ) : (
                        <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                          Link Google Maps tidak terdaftar.
                        </div>
                      )}
                      
                      <div style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                        <div style={{ fontSize: "10px", color: "#888" }}>
                          Dibuat: {new Date(selectedProperty.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                        </div>
                        <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                          Diperbarui: {new Date(selectedProperty.updatedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Dashboard Analytics */}
        {activeTab === "dashboard" && (
          <div className={styles.analyticsContainer}>
            {/* Dashboard Filter Bar */}
            <div className={styles.dashboardFilterBar}>
              <div className={styles.headerWelcome}>
                <span className={styles.welcomeText}><strong>Dashboard Control Center</strong></span>
              </div>
              <div className={styles.dashboardFilters}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={16} color="#c9a961" />
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>Kawasan:</span>
                </div>
                <SearchableSelect
                  options={[
                    { value: "Semua", label: "Semua Kawasan" },
                    ...KAWASANS.map((k) => ({ value: k, label: k }))
                  ]}
                  value={dashboardFilters.kawasan}
                  onChange={(val) => setDashboardFilters({ ...dashboardFilters, kawasan: val })}
                  placeholder="Semua Kawasan"
                />

                <span style={{ fontSize: "13px", fontWeight: "600", marginLeft: "12px" }}>Tipe:</span>
                <SearchableSelect
                  options={[
                    { value: "Semua", label: "Semua Tipe" },
                    { value: "RUKO", label: "Ruko" },
                    { value: "VILLA", label: "Villa" }
                  ]}
                  value={dashboardFilters.tipe}
                  onChange={(val) => setDashboardFilters({ ...dashboardFilters, tipe: val })}
                  placeholder="Semua Tipe"
                />

                <span style={{ fontSize: "13px", fontWeight: "600", marginLeft: "12px" }}>Mulai:</span>
                <input
                  type="date"
                  className={styles.dashboardDateInput}
                  value={dashboardFilters.startDate}
                  onChange={(e) => setDashboardFilters({ ...dashboardFilters, startDate: e.target.value })}
                />

                <span style={{ fontSize: "13px", fontWeight: "600", marginLeft: "12px" }}>Sampai:</span>
                <input
                  type="date"
                  className={styles.dashboardDateInput}
                  value={dashboardFilters.endDate}
                  onChange={(e) => setDashboardFilters({ ...dashboardFilters, endDate: e.target.value })}
                />

                {(dashboardFilters.startDate || dashboardFilters.endDate) && (
                  <button
                    type="button"
                    className={styles.dashboardDateClearBtn}
                    onClick={() => setDashboardFilters({ ...dashboardFilters, startDate: "", endDate: "" })}
                    title="Reset Filter Tanggal"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className={styles.statsGrid}>
              {/* Card 1: Total Nilai Inventori */}
              <div className={styles.statsCard}>
                <div className={styles.statsIcon} style={{ backgroundColor: "#fdfaf3", color: "#c9a961" }}>
                  <Building2 size={22} />
                </div>
                <div className={styles.statsDetails}>
                  <span className={styles.statsLabel}>Total Nilai Inventori</span>
                  <span className={styles.statsValue} title={formatRupiah(totalInventoryValue)}>{formatRupiah(totalInventoryValue)}</span>
                  <span className={styles.statsSub} style={{ color: "#48bb78", fontWeight: "bold" }}>
                    +2.5% vs bulan lalu
                  </span>
                </div>
              </div>

              {/* Card 2: Rata-rata Harga Properti */}
              <div className={styles.statsCard}>
                <div className={styles.statsIcon} style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}>
                  <Activity size={22} />
                </div>
                <div className={styles.statsDetails}>
                  <span className={styles.statsLabel}>Rata-rata Harga Properti</span>
                  <span className={styles.statsValue} title={formatRupiah(averagePropertyPrice)}>{formatRupiah(averagePropertyPrice)}</span>
                  <span className={styles.statsSub}>Berdasarkan data saat ini</span>
                </div>
              </div>

              {/* Card 3: Tingkat Konversi Penjualan */}
              <div className={styles.statsCard}>
                <div className={styles.statsIcon} style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
                  <Users size={22} />
                </div>
                <div className={styles.statsDetails}>
                  <span className={styles.statsLabel}>Konversi Penjualan</span>
                  <span className={styles.statsValue} title={`${conversionRate}%`}>{conversionRate}%</span>
                  <span className={styles.statsSub}>
                    {soldOutCount} dari {filteredDashboardProperties.length} terjual
                  </span>
                </div>
              </div>

              {/* Card 4: Inventory Velocity */}
              <div className={styles.statsCard}>
                <div className={styles.statsIcon} style={{ backgroundColor: "#ffebee", color: "#b33a3a" }}>
                  <ShieldAlert size={22} />
                </div>
                <div className={styles.statsDetails}>
                  <span className={styles.statsLabel}>Inventory Velocity</span>
                  <span className={styles.statsValue} title={`${inventoryVelocity} Unit`}>{inventoryVelocity} Unit</span>
                  <span className={styles.statsSub}>Ditambahkan dalam 30 hari terakhir</span>
                </div>
              </div>
            </div>

            {/* Split Grid: Left Quick Actions/Health, Right Activity Trend Area Chart */}
            <div className={styles.dashboardGrid}>
              <div className={styles.leftControlPanel}>
                {/* Quick Actions Panel */}
                <div className={styles.quickActionsCard}>
                  <h3 className={styles.cardHeader} style={{ fontSize: "14px", fontWeight: "700", borderBottom: "none", padding: "0 0 12px 0" }}>
                    Tindakan Cepat / Quick Actions
                  </h3>
                  <div className={styles.quickActionsGrid}>
                    <button className={styles.quickActionBtn} onClick={openCreateForm}>
                      <Plus size={16} color="#c9a961" />
                      Tambah Properti
                    </button>
                    <button className={styles.quickActionBtn} onClick={handleExportExcel}>
                      <Download size={16} color="#c9a961" />
                      Ekspor Excel
                    </button>

                  </div>
                </div>

                {/* Health Monitor Panel */}
                <div className={styles.healthMonitorCard}>
                  <h3 className={styles.cardHeader} style={{ fontSize: "14px", fontWeight: "700", borderBottom: "none", padding: "0 0 12px 0" }}>
                    Monitor Kesehatan Data Properti
                  </h3>
                  <div className={styles.healthList}>
                    {healthIssues.length === 0 ? (
                      <div className={styles.healthEmpty}>
                        🎉 Semua data lengkap & sehat!
                      </div>
                    ) : (
                      healthIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className={styles.healthItem}
                          onClick={() => handleInspectProperty(issue.property)}
                          title="Klik untuk memeriksa di tabel properti"
                        >
                          <span className={styles.healthItemTitle}>
                            {issue.property.namaProperti}
                          </span>
                          <span className={styles.healthItemDetail}>
                            <AlertTriangle size={12} /> {issue.issues}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Area Chart: System Activity Trend */}
              <div className={styles.dashboardCard}>
                <div className={styles.cardHeader} style={{ borderBottom: "none", padding: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Tren Aktivitas Sistem (7 Hari Terakhir)</span>
                  <Activity size={16} color="#c9a961" />
                </div>
                <div style={{ minHeight: "280px" }}>
                  <Chart
                    options={activityChartOptions}
                    series={[
                      {
                        name: "Aktivitas Log",
                        data: systemActivityTrend.counts
                      }
                    ]}
                    type="area"
                    height="280"
                  />
                </div>
              </div>
            </div>

            {/* Three Visualizers Bottom Row */}
            <div className={styles.chartsRow}>
              {/* Chart 1: Rasio Stock & Tipe Unit */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader} style={{ borderBottom: "none", padding: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Rasio Stock & Tipe Unit</span>
                  <Activity size={16} color="#c9a961" />
                </div>
                
                <div style={{ display: "flex", justifyContent: "center", minHeight: "180px", alignItems: "center" }}>
                  <Chart
                    options={donutChartOptions}
                    series={[inStockCount, soldOutCount]}
                    type="donut"
                    width="280"
                  />
                </div>

                <div className={styles.typeDistribution} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #edf2f7" }}>
                  <div className={styles.typeProgressLabels} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                    <span>Ruko ({Math.round((filteredDashboardProperties.filter(p => p.tipe === "RUKO").length / (filteredDashboardProperties.length || 1)) * 100)}%)</span>
                    <span>Villa ({Math.round((filteredDashboardProperties.filter(p => p.tipe === "VILLA").length / (filteredDashboardProperties.length || 1)) * 100)}%)</span>
                  </div>
                  <div className={styles.progressBarWrapper} style={{ height: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", display: "flex", overflow: "hidden" }}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${Math.round((filteredDashboardProperties.filter(p => p.tipe === "RUKO").length / (filteredDashboardProperties.length || 1)) * 100)}%`, 
                        backgroundColor: "#c9a961" 
                      }} 
                    />
                    <div 
                      className={styles.progressBarFill} 
                      style={{ 
                        width: `${Math.round((filteredDashboardProperties.filter(p => p.tipe === "VILLA").length / (filteredDashboardProperties.length || 1)) * 100)}%`, 
                        backgroundColor: "#111111" 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Chart 2: Price Distribution column chart */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader} style={{ borderBottom: "none", padding: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Distribusi Harga Properti</span>
                  <Building2 size={16} color="#c9a961" />
                </div>
                <div style={{ minHeight: "280px" }}>
                  <Chart
                    options={priceChartOptions}
                    series={[
                      {
                        name: "Jumlah Unit",
                        data: priceDistribution
                      }
                    ]}
                    type="bar"
                    height="280"
                  />
                </div>
              </div>

              {/* Chart 3: Geographic Asset Value Density horizontal bar chart */}
              <div className={styles.analyticsCard}>
                <div className={styles.cardHeader} style={{ borderBottom: "none", padding: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Densitas Nilai Aset per Kawasan</span>
                  <History size={16} color="#c9a961" />
                </div>
                <div style={{ minHeight: "280px" }}>
                  <Chart
                    options={geographicChartOptions}
                    series={[
                      {
                        name: "Nilai Aset",
                        data: geographicAssetDensity.map((item) => item.value)
                      }
                    ]}
                    type="bar"
                    height="280"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Arsip: Properti Terhapus (Soft Delete) */}
        {activeTab === "arsip" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Arsip Properti (Terhapus)</h1>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "-12px 0 20px 0" }}>
              Daftar properti yang telah dihapus (soft-delete). Superadmin dapat memulihkan properti ini ke database aktif.
            </p>

            <div className={styles.filterCard} style={{ padding: "0", overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Memuat data arsip...</div>
              ) : properties.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Tidak ada properti di arsip.</div>
              ) : (
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>No</th>
                      <th>Nama Properti</th>
                      <th>Kawasan</th>
                      <th>Tipe</th>
                      <th>Harga</th>
                      <th>Dihapus Pada</th>
                      <th className={styles.actionCell}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p, idx) => (
                      <tr key={p.id} className={styles.customTableRow}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: "700" }}>{p.namaProperti}</td>
                        <td>{p.kawasan?.join(", ") || "-"}</td>
                        <td>{p.tipe}</td>
                        <td style={{ color: "#c9a961", fontWeight: "700" }}>{formatRupiah(p.price)}</td>
                        <td style={{ fontSize: "12px", color: "#666" }}>
                          {p.deletedAt ? new Date(p.deletedAt).toLocaleString("id-ID") : "-"}
                        </td>
                        <td className={styles.actionCell}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "nowrap" }}>
                            <button
                              type="button"
                              className={styles.tableActionBtn}
                              style={{ backgroundColor: "#1b8a5a", color: "#fff", border: "none" }}
                              onClick={() => handleRestore(p.id, p.namaProperti)}
                              title="Pulihkan Properti"
                            >
                              <History size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab Dokumentasi: Panduan Superadmin */}
        {activeTab === "docs" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Panduan Penggunaan (Superadmin)</h1>
            </div>
            
            <div className={styles.filterCard} style={{ lineHeight: "1.6", color: "#2d3748" }}>
              <section style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", borderBottom: "2px solid #c9a961", display: "inline-block", marginBottom: "12px", color: "#1a1a1a" }}>1. Manajemen Properti</h2>
                <p>Klik menu <strong>Daftar Properti</strong> untuk melihat seluruh basis data. Gunakan tombol <strong>+ TAMBAH PROPERTI</strong> untuk membuat entri baru.</p>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  <li><strong>Import:</strong> Memungkinkan penambahan massal via file Excel.</li>
                  <li><strong>Export:</strong> Mengunduh seluruh data properti ke format .xlsx.</li>
                  <li><strong>Edit:</strong> Klik ikon pensil di baris tabel untuk mengubah data. Indikator <em>(Diubah)</em> akan muncul jika ada perubahan belum disimpan.</li>
                  <li><strong>Hapus:</strong> Menggunakan sistem <em>Soft Delete</em>. Data tidak hilang permanen, tapi masuk ke menu Arsip.</li>
                </ul>
              </section>

              <section style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", borderBottom: "2px solid #c9a961", display: "inline-block", marginBottom: "12px", color: "#1a1a1a" }}>2. Arsip & Pemulihan</h2>
                <p>Menu <strong>Arsip Properti</strong> menampung data yang telah dihapus. Klik tombol <strong>PULIHKAN</strong> untuk mengembalikan properti ke status aktif.</p>
              </section>

              <section style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", borderBottom: "2px solid #c9a961", display: "inline-block", marginBottom: "12px", color: "#1a1a1a" }}>3. Keamanan & Sesi</h2>
                <p>Gunakan menu <strong>Kelola Admin</strong> untuk membuat akun staf baru. Menu <strong>Sesi Aktif</strong> memungkinkan Superadmin memutus koneksi pengguna yang mencurigakan secara <em>real-time</em>.</p>
              </section>

              <section>
                <h2 style={{ fontSize: "18px", borderBottom: "2px solid #c9a961", display: "inline-block", marginBottom: "12px", color: "#1a1a1a" }}>4. Audit Log</h2>
                <p>Setiap mutasi data (Tambah/Edit/Hapus) dicatat dalam <strong>Audit Log</strong>, termasuk informasi waktu, pelaku, dan perubahan nilai yang dilakukan.</p>
              </section>
            </div>
          </div>
        )}
        {/* Tab 3: Audit Logs */}
        {activeTab === "audit" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Log Audit Perubahan Sistem</h1>
            </div>
            
            {!hasPermission(role, RESOURCES.AUDIT_LOGS, ACTIONS.READ) ? (
              <div className={styles.filterCard} style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
                <h3 style={{ margin: "0 0 8px 0", color: "#b33a3a" }}>Akses Terbatas (Superadmin Only)</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  Maaf, log audit sistem hanya dapat diakses oleh akun dengan peran Superadmin.
                  Gunakan simulator di pojok kanan atas untuk mengubah peran.
                </p>
              </div>
            ) : (
              <div>
                {/* Filters & Search Control Bar */}
                <div className={styles.filterCard} style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <input
                      type="text"
                      placeholder="Cari email, perubahan, modul, IP..."
                      className={styles.filterInput}
                      style={{ width: "100%" }}
                      value={auditSearch}
                      onChange={(e) => {
                        setAuditSearch(e.target.value);
                        setAuditCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <div style={{ width: "160px" }}>
                    <select
                      className={styles.filterInput}
                      style={{ width: "100%" }}
                      value={auditFilterAction}
                      onChange={(e) => {
                        setAuditFilterAction(e.target.value);
                        setAuditCurrentPage(1);
                      }}
                    >
                      <option value="">Semua Aksi</option>
                      <option value="CREATE">CREATE</option>
                      <option value="UPDATE">UPDATE</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div style={{ width: "160px" }}>
                    <select
                      className={styles.filterInput}
                      style={{ width: "100%" }}
                      value={auditFilterModule}
                      onChange={(e) => {
                        setAuditFilterModule(e.target.value);
                        setAuditCurrentPage(1);
                      }}
                    >
                      <option value="">Semua Modul</option>
                      <option value="User">User</option>
                      <option value="Property">Property</option>
                      <option value="RolePermission">RolePermission</option>
                    </select>
                  </div>

                  {(auditSearch || auditFilterAction || auditFilterModule) && (
                    <button
                      className={styles.btnCancel}
                      style={{ padding: "8px 16px" }}
                      onClick={() => {
                        setAuditSearch("");
                        setAuditFilterAction("");
                        setAuditFilterModule("");
                        setAuditCurrentPage(1);
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className={styles.customTableWrapper}>
                  {sortedAuditLogs.length === 0 ? (
                    <div className={styles.noLogs}>
                      Tidak ada aktivitas sistem yang tercatat atau cocok dengan pencarian.
                    </div>
                  ) : (
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th onClick={() => handleAuditSort("createdAt")} className={styles.sortHeader}>
                            Waktu (WIB) {renderSortIcon("createdAt", auditSortField, auditSortDirection)}
                          </th>
                          <th onClick={() => handleAuditSort("user")} className={styles.sortHeader}>
                            Pengguna {renderSortIcon("user", auditSortField, auditSortDirection)}
                          </th>
                          <th onClick={() => handleAuditSort("actionType")} className={styles.sortHeader}>
                            Aksi {renderSortIcon("actionType", auditSortField, auditSortDirection)}
                          </th>
                          <th onClick={() => handleAuditSort("entityName")} className={styles.sortHeader}>
                            Modul {renderSortIcon("entityName", auditSortField, auditSortDirection)}
                          </th>
                          <th onClick={() => handleAuditSort("changeSummary")} className={styles.sortHeader}>
                            Ringkasan Perubahan {renderSortIcon("changeSummary", auditSortField, auditSortDirection)}
                          </th>
                          <th onClick={() => handleAuditSort("ipAddress")} className={styles.sortHeader}>
                            Alamat IP {renderSortIcon("ipAddress", auditSortField, auditSortDirection)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAuditLogs.map((log) => (
                          <tr key={log.id} className={styles.customTableRow}>
                            <td style={{ color: "#666", whiteSpace: "nowrap" }}>
                              {new Date(log.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                            </td>
                            <td style={{ fontWeight: 600 }}>{log.user?.email || "System"}</td>
                            <td>
                              <span
                                className={`${styles.actionBadge} ${
                                  log.actionType === "CREATE"
                                    ? styles.actionCreate
                                    : log.actionType === "UPDATE"
                                    ? styles.actionUpdate
                                    : styles.actionDelete
                                }`}
                              >
                                {log.actionType}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, color: "#444" }}>{log.entityName}</td>
                            <td style={{ color: "#1a1a1a", wordBreak: "break-all" }}>{log.changeSummary}</td>
                            <td className={styles.ipAddress}>{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {sortedAuditLogs.length > 0 && (
                  <div className={styles.customTablePagination}>
                    <div className={styles.paginationInfo}>
                      Menampilkan <strong>{Math.min((auditCurrentPage - 1) * auditPageSize + 1, sortedAuditLogs.length)}</strong> - <strong>{Math.min(auditCurrentPage * auditPageSize, sortedAuditLogs.length)}</strong> dari <strong>{sortedAuditLogs.length}</strong> log
                    </div>
                    
                    <div className={styles.paginationControls}>
                      <div className={styles.pageSizeSelectWrapper}>
                        <span>Tampilkan:</span>
                        <select
                          className={styles.paginationPageSizeSelect}
                          value={auditPageSize}
                          onChange={(e) => {
                            setAuditPageSize(Number(e.target.value));
                            setAuditCurrentPage(1);
                          }}
                        >
                          {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className={styles.paginationPages}>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={auditCurrentPage === 1}
                          onClick={() => setAuditCurrentPage(1)}
                        >
                          «
                        </button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={auditCurrentPage === 1}
                          onClick={() => setAuditCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                          ‹
                        </button>
                        
                        {Array.from({ length: auditTotalPages }, (_, idx) => idx + 1)
                          .filter(page => {
                            return page === 1 || page === auditTotalPages || Math.abs(page - auditCurrentPage) <= 1;
                          })
                          .map((page, idx, arr) => {
                            const isPrevPageDotted = idx > 0 && page - arr[idx - 1] > 1;
                            return (
                              <span key={page} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                {isPrevPageDotted && <span className={styles.paginationEllipsis}>...</span>}
                                <button
                                  type="button"
                                  className={`${styles.paginationBtn} ${auditCurrentPage === page ? styles.paginationBtnActive : ""}`}
                                  onClick={() => setAuditCurrentPage(page)}
                                >
                                  {page}
                                </button>
                              </span>
                            );
                          })}
                        
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={auditCurrentPage === auditTotalPages}
                          onClick={() => setAuditCurrentPage(prev => Math.min(prev + 1, auditTotalPages))}
                        >
                          ›
                        </button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={auditCurrentPage === auditTotalPages}
                          onClick={() => setAuditCurrentPage(auditTotalPages)}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Kelola Testimoni */}
        {activeTab === "testimonials" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Kelola Testimoni & Feedback</h1>
            </div>

            {/* Standard Filter Card */}
            <div className={styles.filterCard}>
              <div className={styles.searchBar}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, pesan, atau jabatan..."
                    className={styles.searchInput}
                    value={testimonialSearch}
                    onChange={(e) => {
                      setTestimonialSearch(e.target.value);
                      setTestimonialCurrentPage(1);
                    }}
                    style={{ paddingRight: "40px" }}
                  />
                  <Search size={18} color="#cbd5e0" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              {testimonialsLoading ? (
                renderSkeleton()
              ) : filteredTestimonials.length === 0 ? (
                <div className={styles.tableWrapper}>
                  <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    Belum ada testimoni yang cocok dengan kriteria pencarian.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div className={styles.customTableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center" }}>No</th>
                          <th onClick={() => handleTestimonialSort("nama")} className={styles.sortHeader}>
                            Nama & Jabatan {renderSortIcon("nama", testimonialSortField, testimonialSortDirection)}
                          </th>
                          <th>Pesan Testimoni</th>
                          <th onClick={() => handleTestimonialSort("stars")} className={styles.sortHeader} style={{ width: "120px" }}>
                            Rating {renderSortIcon("stars", testimonialSortField, testimonialSortDirection)}
                          </th>
                          <th onClick={() => handleTestimonialSort("isApproved")} className={styles.sortHeader} style={{ width: "150px" }}>
                            Status {renderSortIcon("isApproved", testimonialSortField, testimonialSortDirection)}
                          </th>
                          <th style={{ width: "180px", textAlign: "center" }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTestimonials.map((t, idx) => {
                          const rowNum = (testimonialCurrentPage - 1) * testimonialPageSize + idx + 1;
                          return (
                            <tr key={t.id} className={styles.customTableRow}>
                              <td style={{ textAlign: "center", color: "#888", fontSize: "11px" }}>{rowNum}</td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{t.nama}</div>
                                <div style={{ fontSize: "12px", color: "#666" }}>{t.role}</div>
                              </td>
                              <td className={styles.wrapCell}>{t.content}</td>
                              <td>
                                <div style={{ display: "flex", gap: "2px" }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < t.stars ? "#c9a961" : "none"} color={i < t.stars ? "#c9a961" : "#ccc"} />
                                  ))}
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.badge} ${t.isApproved ? styles.badgeSiapHuni : styles.badgeSoldOut}`}>
                                  {t.isApproved ? "Ditampilkan" : "Menunggu"}
                                </span>
                              </td>
                              <td className={styles.actionCell}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "nowrap" }}>
                                  <button 
                                    className={`${styles.tableActionBtn} ${t.isApproved ? styles.tableActionBtnEdit : styles.tableActionBtnDetail}`}
                                    onClick={() => handleToggleTestimonial(t.id, t.isApproved)}
                                    title={t.isApproved ? "Sembunyikan" : "Tampilkan"}
                                  >
                                    {t.isApproved ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <button 
                                    className={`${styles.tableActionBtn} ${styles.tableActionBtnDelete}`}
                                    onClick={() => handleDeleteTestimonial(t.id)}
                                    title="Hapus Testimoni"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard Pagination */}
                  <div className={styles.customTablePagination}>
                    <div className={styles.paginationInfo}>
                      Menampilkan <strong>{Math.min((testimonialCurrentPage - 1) * testimonialPageSize + 1, filteredTestimonials.length)}</strong> - <strong>{Math.min(testimonialCurrentPage * testimonialPageSize, filteredTestimonials.length)}</strong> dari <strong>{filteredTestimonials.length}</strong> testimoni
                    </div>
                    <div className={styles.paginationControls}>
                      <div className={styles.pageSizeSelectWrapper}>
                        <span>Tampilkan:</span>
                        <select
                          className={styles.paginationPageSizeSelect}
                          value={testimonialPageSize}
                          onChange={(e) => {
                            setTestimonialPageSize(Number(e.target.value));
                            setTestimonialCurrentPage(1);
                          }}
                        >
                          {[25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.paginationPages}>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={testimonialCurrentPage === 1}
                          onClick={() => setTestimonialCurrentPage(1)}
                        >«</button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={testimonialCurrentPage === 1}
                          onClick={() => setTestimonialCurrentPage(prev => Math.max(prev - 1, 1))}
                        >‹</button>
                        <span className={styles.paginationBtnActive} style={{ padding: "0 15px" }}>{testimonialCurrentPage}</span>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={testimonialCurrentPage === testimonialTotalPages}
                          onClick={() => setTestimonialCurrentPage(prev => Math.min(prev + 1, testimonialTotalPages))}
                        >›</button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={testimonialCurrentPage === testimonialTotalPages}
                          onClick={() => setTestimonialCurrentPage(testimonialTotalPages)}
                        >»</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Pesan Masuk */}
        {activeTab === "messages" && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Pesan Kontak Masuk</h1>
            </div>

            <div className={styles.filterCard}>
              <div className={styles.searchBar}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, email, nomor HP, atau isi pesan..."
                    className={styles.searchInput}
                    value={messageSearch}
                    onChange={(e) => {
                      setMessageSearch(e.target.value);
                      setMessageCurrentPage(1);
                    }}
                    style={{ paddingRight: "40px" }}
                  />
                  <Search size={18} color="#cbd5e0" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              {messagesLoading ? (
                renderSkeleton()
              ) : filteredMessages.length === 0 ? (
                <div className={styles.tableWrapper}>
                  <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    Tidak ada pesan masuk yang cocok dengan kriteria pencarian.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div className={styles.customTableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center" }}>No</th>
                          <th onClick={() => handleMessageSort("createdAt")} className={styles.sortHeader} style={{ width: "160px" }}>
                            Waktu {renderSortIcon("createdAt", messageSortField, messageSortDirection)}
                          </th>
                          <th onClick={() => handleMessageSort("nama")} className={styles.sortHeader}>
                            Pengirim {renderSortIcon("nama", messageSortField, messageSortDirection)}
                          </th>
                          <th onClick={() => handleMessageSort("subjek")} className={styles.sortHeader} style={{ width: "150px" }}>
                            Subjek {renderSortIcon("subjek", messageSortField, messageSortDirection)}
                          </th>
                          <th>Pesan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMessages.map((msg, idx) => {
                          const rowNum = (messageCurrentPage - 1) * messagePageSize + idx + 1;
                          return (
                            <tr key={msg.id} className={styles.customTableRow}>
                              <td style={{ textAlign: "center", color: "#888", fontSize: "11px" }}>{rowNum}</td>
                              <td style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap" }}>
                                {new Date(msg.createdAt).toLocaleString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                              </td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{msg.nama}</div>
                                <div style={{ fontSize: "12px", color: "#c9a961", fontWeight: 600 }}>{msg.hp}</div>
                                <div style={{ fontSize: "12px", color: "#666" }}>{msg.email}</div>
                              </td>
                              <td>
                                <span className={styles.badge} style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "1px solid #cbd5e0" }}>
                                  {msg.subjek || "Umum"}
                                </span>
                              </td>
                              <td className={styles.wrapCell} style={{ fontSize: "14px", color: "#4a5568" }}>{msg.pesan}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard Pagination */}
                  <div className={styles.customTablePagination}>
                    <div className={styles.paginationInfo}>
                      Menampilkan <strong>{Math.min((messageCurrentPage - 1) * messagePageSize + 1, filteredMessages.length)}</strong> - <strong>{Math.min(messageCurrentPage * messagePageSize, filteredMessages.length)}</strong> dari <strong>{filteredMessages.length}</strong> pesan
                    </div>
                    <div className={styles.paginationControls}>
                      <div className={styles.pageSizeSelectWrapper}>
                        <span>Tampilkan:</span>
                        <select
                          className={styles.paginationPageSizeSelect}
                          value={messagePageSize}
                          onChange={(e) => {
                            setMessagePageSize(Number(e.target.value));
                            setMessageCurrentPage(1);
                          }}
                        >
                          {[25, 50, 100].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.paginationPages}>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={messageCurrentPage === 1}
                          onClick={() => setMessageCurrentPage(1)}
                        >«</button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={messageCurrentPage === 1}
                          onClick={() => setMessageCurrentPage(prev => Math.max(prev - 1, 1))}
                        >‹</button>
                        <span className={styles.paginationBtnActive} style={{ padding: "0 15px" }}>{messageCurrentPage}</span>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={messageCurrentPage === messageTotalPages}
                          onClick={() => setMessageCurrentPage(prev => Math.min(prev + 1, messageTotalPages))}
                        >›</button>
                        <button
                          type="button"
                          className={styles.paginationBtn}
                          disabled={messageCurrentPage === messageTotalPages}
                          onClick={() => setMessageCurrentPage(messageTotalPages)}
                        >»</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Sesi Aktif */}
        {activeTab === "sesi" && hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE) && (
          <div>
            <h1 className={styles.pageTitle}>Manajemen Sesi Aktif</h1>
            <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 20px 0" }}>
              Daftar perangkat yang saat ini masuk. Anda dapat memaksa logout perangkat mana pun untuk mengamankan akun.
            </p>
            
            {/* Standard Filter Card */}
            <div className={styles.filterCard}>
              <div className={styles.searchBar}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Cari email, perangkat, IP..."
                    className={styles.searchInput}
                    value={sessionSearch}
                    onChange={(e) => {
                      setSessionSearch(e.target.value);
                      setSessionCurrentPage(1);
                    }}
                    style={{ paddingRight: "40px" }}
                  />
                  <Search size={18} color="#cbd5e0" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                
                <div style={{ width: "200px" }}>
                  <select
                    className={styles.select}
                    value={sessionFilterStatus}
                    onChange={(e) => {
                      setSessionFilterStatus(e.target.value);
                      setSessionCurrentPage(1);
                    }}
                  >
                    <option value="">Semua Status Sesi</option>
                    <option value="current">Sesi Ini</option>
                    <option value="active">Sesi Aktif Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              {sessionsLoading ? (
                renderSkeleton()
              ) : sortedActiveSessions.length === 0 ? (
                <div className={styles.tableWrapper}>
                  <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                    Tidak ada sesi aktif terdeteksi atau cocok dengan pencarian.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <div className={styles.customTableWrapper}>
                    <table className={styles.customTable}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center" }}>No</th>
                          <th onClick={() => handleSessionSort("deviceName")} className={styles.sortHeader}>
                            Perangkat / Browser {renderSortIcon("deviceName", sessionSortField, sessionSortDirection)}
                          </th>
                          <th onClick={() => handleSessionSort("email")} className={styles.sortHeader}>
                            Email Akun {renderSortIcon("email", sessionSortField, sessionSortDirection)}
                          </th>
                          <th onClick={() => handleSessionSort("ipAddress")} className={styles.sortHeader}>
                            Alamat IP {renderSortIcon("ipAddress", sessionSortField, sessionSortDirection)}
                          </th>
                          <th onClick={() => handleSessionSort("loginTime")} className={styles.sortHeader}>
                            Waktu Login {renderSortIcon("loginTime", sessionSortField, sessionSortDirection)}
                          </th>
                          <th>Status</th>
                          <th className={styles.actionCell}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedActiveSessions.map((session, idx) => {
                          const rowNum = (sessionCurrentPage - 1) * sessionPageSize + idx + 1;
                          return (
                            <tr key={session.id} className={styles.customTableRow}>
                              <td style={{ textAlign: "center", color: "#888", fontSize: "11px" }}>{rowNum}</td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{session.deviceName}</div>
                                <div style={{ fontSize: "11px", color: "#888", wordBreak: "break-all", marginTop: "2px" }}>
                                  {session.rawUserAgent}
                                </div>
                              </td>
                              <td style={{ fontWeight: 600 }}>{session.email}</td>
                              <td><code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{session.ipAddress}</code></td>
                              <td style={{ color: "#666", fontSize: "12px", whiteSpace: "nowrap" }}>
                                {new Date(session.loginTime).toLocaleString("id-ID")} WIB
                              </td>
                              <td>
                                {session.isCurrent ? (
                                  <span className={`${styles.badge} ${styles.badgeSiapHuni}`}>Sesi Ini</span>
                                ) : (
                                  <span className={`${styles.badge} ${styles.badgeSiapKosong}`}>Aktif</span>
                                )}
                              </td>
                              <td className={styles.actionCell}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "nowrap" }}>
                                  <button
                                    className={`${styles.tableActionBtn} ${styles.tableActionBtnDelete}`}
                                    onClick={() => handleRevokeSession(session.id, session.isCurrent)}
                                    title="Cabut Akses Sesi"
                                  >
                                    <Ban size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Standard Pagination */}
                  <div className={styles.customTablePagination}>
                    <div className={styles.paginationInfo}>
                      Menampilkan <strong>{Math.min((sessionCurrentPage - 1) * sessionPageSize + 1, sortedActiveSessions.length)}</strong> - <strong>{Math.min(sessionCurrentPage * sessionPageSize, sortedActiveSessions.length)}</strong> dari <strong>{sortedActiveSessions.length}</strong> sesi
                    </div>
                    <div className={styles.paginationControls}>
                      <div className={styles.pageSizeSelectWrapper}>
                        <span>Tampilkan:</span>
                        <select
                          className={styles.paginationPageSizeSelect}
                          value={sessionPageSize}
                          onChange={(e) => {
                            setSessionPageSize(Number(e.target.value));
                            setSessionCurrentPage(1);
                          }}
                        >
                          {[10, 25, 50].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.paginationPages}>
                        <button type="button" className={styles.paginationBtn} disabled={sessionCurrentPage === 1} onClick={() => setSessionCurrentPage(1)}>«</button>
                        <button type="button" className={styles.paginationBtn} disabled={sessionCurrentPage === 1} onClick={() => setSessionCurrentPage(prev => Math.max(prev - 1, 1))}>‹</button>
                        <span className={styles.paginationBtnActive} style={{ padding: "0 15px" }}>{sessionCurrentPage}</span>
                        <button type="button" className={styles.paginationBtn} disabled={sessionCurrentPage === sessionTotalPages} onClick={() => setSessionCurrentPage(prev => Math.min(prev + 1, sessionTotalPages))}>›</button>
                        <button type="button" className={styles.paginationBtn} disabled={sessionCurrentPage === sessionTotalPages} onClick={() => setSessionCurrentPage(sessionTotalPages)}>»</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Kelola Admin */}
        {activeTab === "admins" && hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE) && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Kelola Akun Admin</h1>
              <button 
                className={styles.addBtn}
                onClick={() => {
                  setAdminFormMode("create");
                  setAdminFormData({ id: "", email: "", password: "", role: "ADMIN", isActive: true });
                  setAdminFormErrors({});
                  setIsAdminFormOpen(true);
                }}
              >
                <Plus size={16} style={{ marginRight: "6px" }} /> Tambah Admin Baru
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "-12px 0 20px 0" }}>
              Daftar akun administrator properti. Superadmin dapat membuat akun baru, mengaktifkan/nonaktifkan akun, dan mengatur ulang password admin.
            </p>

            {/* Filters & Search Control Bar */}
            <div className={styles.filterCard} style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Cari email admin..."
                  className={styles.filterInput}
                  style={{ width: "100%" }}
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setAdminCurrentPage(1);
                  }}
                />
              </div>
              
              <div style={{ width: "160px" }}>
                <select
                  className={styles.filterInput}
                  style={{ width: "100%" }}
                  value={adminFilterRole}
                  onChange={(e) => {
                    setAdminFilterRole(e.target.value);
                    setAdminCurrentPage(1);
                  }}
                >
                  <option value="">Semua Peran</option>
                  {permissionsMatrix ? Object.keys(permissionsMatrix).map(rKey => (
                    <option key={rKey} value={rKey}>{rKey}</option>
                  )) : (
                    <>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ width: "160px" }}>
                <select
                  className={styles.filterInput}
                  style={{ width: "100%" }}
                  value={adminFilterStatus}
                  onChange={(e) => {
                    setAdminFilterStatus(e.target.value);
                    setAdminCurrentPage(1);
                  }}
                >
                  <option value="">Semua Status keaktifan</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              {(adminSearch || adminFilterRole || adminFilterStatus) && (
                <button
                  className={styles.btnCancel}
                  style={{ padding: "8px 16px" }}
                  onClick={() => {
                    setAdminSearch("");
                    setAdminFilterRole("");
                    setAdminFilterStatus("");
                    setAdminCurrentPage(1);
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <div className={styles.customTableWrapper}>
              {adminsLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  Memuat daftar admin...
                </div>
              ) : sortedAdmins.length === 0 ? (
                <div className={styles.noLogs}>
                  Tidak ada akun admin yang ditemukan atau cocok dengan pencarian.
                </div>
              ) : (
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th onClick={() => handleAdminSort("nama")} className={styles.sortHeader}>
                        Nama Admin {renderSortIcon("nama", adminSortField, adminSortDirection)}
                      </th>
                      <th onClick={() => handleAdminSort("email")} className={styles.sortHeader}>
                        Email Akun {renderSortIcon("email", adminSortField, adminSortDirection)}
                      </th>
                      <th onClick={() => handleAdminSort("role")} className={styles.sortHeader}>
                        Peran {renderSortIcon("role", adminSortField, adminSortDirection)}
                      </th>
                      <th onClick={() => handleAdminSort("isActive")} className={styles.sortHeader}>
                        Status Keaktifan {renderSortIcon("isActive", adminSortField, adminSortDirection)}
                      </th>
                      <th onClick={() => handleAdminSort("requiresPasswordReset")} className={styles.sortHeader}>
                        Perlu Reset Password {renderSortIcon("requiresPasswordReset", adminSortField, adminSortDirection)}
                      </th>
                      <th onClick={() => handleAdminSort("createdAt")} className={styles.sortHeader}>
                        Tanggal Dibuat {renderSortIcon("createdAt", adminSortField, adminSortDirection)}
                      </th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdmins.map((admin) => (
                      <tr key={admin.id} className={styles.customTableRow}>
                        <td style={{ fontWeight: 600, color: "#1a1a1a" }}>{admin.nama || "-"}</td>
                        <td style={{ color: "#444" }}>{admin.email}</td>
                        <td>
                          <span className={`${styles.actionBadge} ${styles.actionUpdate}`}>{admin.role}</span>
                        </td>
                        <td>
                          {admin.isActive ? (
                            <span className={`${styles.actionBadge} ${styles.actionCreate}`}>Aktif</span>
                          ) : (
                            <span className={`${styles.actionBadge} ${styles.actionDelete}`}>Nonaktif</span>
                          )}
                        </td>
                        <td>
                          {admin.requiresPasswordReset ? (
                            <span className={`${styles.actionBadge} ${styles.actionDelete}`}>Ya</span>
                          ) : (
                            <span className={`${styles.actionBadge} ${styles.actionCreate}`}>Tidak</span>
                          )}
                        </td>
                        <td style={{ color: "#666" }}>
                          {new Date(admin.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                        </td>
                        <td className={styles.actionCell}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", flexWrap: "nowrap" }}>
                            <button
                              type="button"
                              className={`${styles.tableActionBtn} ${admin.isActive ? styles.tableActionBtnDelete : styles.tableActionBtnEdit}`}
                              onClick={() => handleToggleAdminStatus(admin.id, admin.isActive)}
                              title={admin.isActive ? "Nonaktifkan Admin" : "Aktifkan Admin"}
                            >
                              {admin.isActive ? <Ban size={14} /> : <ToggleRight size={14} />}
                            </button>
                            <button
                              type="button"
                              className={`${styles.tableActionBtn} ${styles.tableActionBtnDetail}`}
                              onClick={() => {
                                setResetAdminId(admin.id);
                                setNewAdminPassword("");
                                setResetSuccessMessage("");
                                setIsResetPasswordOpen(true);
                              }}
                              title="Reset Password"
                            >
                              <Key size={14} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.tableActionBtn} ${styles.tableActionBtnEdit}`}
                              onClick={() => openEditFormForAdmin(admin)}
                              title="Edit Detail Admin"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.tableActionBtn} ${styles.tableActionBtnDelete}`}
                              onClick={() => openDeleteConfirmationForAdmin(admin)}
                              title="Hapus Admin Permanen"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {sortedAdmins.length > 0 && (
              <div className={styles.customTablePagination}>
                <div className={styles.paginationInfo}>
                  Menampilkan <strong>{Math.min((adminCurrentPage - 1) * adminPageSize + 1, sortedAdmins.length)}</strong> - <strong>{Math.min(adminCurrentPage * adminPageSize, sortedAdmins.length)}</strong> dari <strong>{sortedAdmins.length}</strong> admin
                </div>
                
                <div className={styles.paginationControls}>
                  <div className={styles.pageSizeSelectWrapper}>
                    <span>Tampilkan:</span>
                    <select
                      className={styles.paginationPageSizeSelect}
                      value={adminPageSize}
                      onChange={(e) => {
                        setAdminPageSize(Number(e.target.value));
                        setAdminCurrentPage(1);
                      }}
                    >
                      {[10, 25, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.paginationPages}>
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      disabled={adminCurrentPage === 1}
                      onClick={() => setAdminCurrentPage(1)}
                    >
                      «
                    </button>
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      disabled={adminCurrentPage === 1}
                      onClick={() => setAdminCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      ‹
                    </button>
                    
                    {Array.from({ length: adminTotalPages }, (_, idx) => idx + 1)
                      .filter(page => {
                        return page === 1 || page === adminTotalPages || Math.abs(page - adminCurrentPage) <= 1;
                      })
                      .map((page, idx, arr) => {
                        const isPrevPageDotted = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <span key={page} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {isPrevPageDotted && <span className={styles.paginationEllipsis}>...</span>}
                            <button
                              type="button"
                              className={`${styles.paginationBtn} ${adminCurrentPage === page ? styles.paginationBtnActive : ""}`}
                              onClick={() => setAdminCurrentPage(page)}
                            >
                              {page}
                            </button>
                          </span>
                        );
                      })}
                    
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      disabled={adminCurrentPage === adminTotalPages}
                      onClick={() => setAdminCurrentPage(prev => Math.min(prev + 1, adminTotalPages))}
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      className={styles.paginationBtn}
                      disabled={adminCurrentPage === adminTotalPages}
                      onClick={() => setAdminCurrentPage(adminTotalPages)}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Tab 6: Otorisasi (RBAC) */}
        {activeTab === "rbac" && hasPermission(role, RESOURCES.USERS, ACTIONS.MANAGE) && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Matriks Otorisasi (RBAC)</h1>
              <button 
                className={styles.addBtn}
                disabled={matrixSaving || !permissionsMatrix}
                onClick={handleSavePermissionsMatrix}
              >
                <Save size={16} style={{ marginRight: "6px" }} /> {matrixSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "-12px 0 20px 0" }}>
              Kelola izin akses role secara dinamis. Centang untuk mengizinkan role melakukan tindakan pada modul terkait.
            </p>

            {/* Filters & Search Control Bar */}
            <div className={styles.filterCard} style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Cari modul..."
                  className={styles.filterInput}
                  style={{ width: "100%" }}
                  value={rbacSearch}
                  onChange={(e) => setRbacSearch(e.target.value)}
                />
              </div>

              {rbacSearch && (
                <button
                  className={styles.btnCancel}
                  style={{ padding: "8px 16px" }}
                  onClick={() => setRbacSearch("")}
                >
                  Reset
                </button>
              )}
              
              <div style={{ display: "flex", gap: "8px", marginLeft: "auto", borderLeft: "1px solid #ddd", paddingLeft: "16px" }}>
                <input
                  type="text"
                  placeholder="Nama Role Baru"
                  className={styles.filterInput}
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  style={{ width: "150px" }}
                />
                <button
                  className={styles.addBtn}
                  onClick={handleAddNewRole}
                  style={{ padding: "8px 16px" }}
                >
                  Tambah Role
                </button>
              </div>
            </div>

            <div className={styles.customTableWrapper}>
              {matrixLoading || !permissionsMatrix ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  Memuat matriks otorisasi...
                </div>
              ) : sortedRbacResources.length === 0 ? (
                <div className={styles.noLogs}>
                  Tidak ada modul otorisasi terdaftar atau cocok dengan pencarian.
                </div>
              ) : (
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th onClick={handleRbacSort} className={styles.sortHeader} style={{ textAlign: "left" }}>
                        Modul & Fitur {renderSortIcon("resource", "resource", rbacSortDirection)}
                      </th>
                      <th>Aksi / Tindakan</th>
                      {Object.keys(permissionsMatrix).map((rKey) => (
                        <th key={rKey} style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            {rKey === "SUPERADMIN" ? "👑 " : rKey === "ADMIN" ? "🧑‍💼 " : "👤 "}
                            {rKey}
                            {rKey !== "SUPERADMIN" && rKey !== "ADMIN" && (
                              <button 
                                className={styles.iconBtn} 
                                style={{ padding: "2px", margin: 0, color: "#b33a3a", background: "none", border: "none" }}
                                onClick={() => handleDeleteCustomRole(rKey)}
                                title="Hapus Role"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRbacResources.map((resource) => {
                      // Filter actions applicable to this resource to determine rowspan
                      const validActions = matrixMetadata.actions.filter(action => {
                        if (resource.name === "properties" && action.name === "manage") return false;
                        if (resource.name === "audit_logs" && action.name !== "read") return false;
                        if (resource.name === "messages" && ["update", "manage"].includes(action.name)) return false;
                        if (resource.name === "testimonials" && action.name === "manage") return false;
                        return true;
                      });

                      return validActions.map((action, actionIdx) => {
                        return (
                          <tr key={`${resource.name}-${action.name}`} className={styles.customTableRow}>
                            {actionIdx === 0 ? (
                              <td 
                                rowSpan={validActions.length}
                                style={{ fontWeight: 700, color: "#1a1a1a", borderRight: "1px solid #eee", verticalAlign: "middle" }}
                              >
                                {resource.label}
                              </td>
                            ) : null}
                            <td style={{ fontWeight: 600, color: "#444" }}>{action.label}</td>
                            
                            {Object.keys(permissionsMatrix).map((rKey) => {
                              const hasPerm = permissionsMatrix[rKey]?.[resource.name]?.includes(action.name) || false;
                              return (
                                <td key={`${rKey}-${resource.name}-${action.name}`} style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={hasPerm}
                                    className={styles.customTableCheckbox}
                                    onChange={() => handleMatrixCheckboxChange(rKey, resource.name, action.name)}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>

      {/* CREATE & EDIT FORM MODAL */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                {formMode === "create" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Plus size={18} /> Tambah Properti Baru</span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Pencil size={18} /> Edit Detail Properti</span>
                )}
              </h2>
              <button className={styles.iconBtn} onClick={() => setIsFormOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                {/* Wizard Stepper Header */}
                <div className={styles.wizardStepper}>
                  <div className={`${styles.wizardStep} ${formStep === 1 ? styles.wizardStepActive : ""} ${formStep > 1 ? styles.wizardStepCompleted : ""}`} onClick={() => formStep > 1 && setFormStep(1)} style={{ cursor: formStep > 1 ? "pointer" : "default" }}>
                    <div className={styles.wizardStepNumber}>{formStep > 1 ? "✓" : "1"}</div>
                    <span>Info Utama</span>
                  </div>
                  <div className={styles.wizardStepLine + " " + (formStep > 1 ? styles.wizardStepLineCompleted : "")}></div>
                  <div className={`${styles.wizardStep} ${formStep === 2 ? styles.wizardStepActive : ""} ${formStep > 2 ? styles.wizardStepCompleted : ""}`} onClick={() => formStep > 2 && setFormStep(2)} style={{ cursor: formStep > 2 ? "pointer" : "default" }}>
                    <div className={styles.wizardStepNumber}>{formStep > 2 ? "✓" : "2"}</div>
                    <span>Spesifikasi</span>
                  </div>
                  <div className={styles.wizardStepLine + " " + (formStep > 2 ? styles.wizardStepLineCompleted : "")}></div>
                  <div className={`${styles.wizardStep} ${formStep === 3 ? styles.wizardStepActive : ""}`}>
                    <div className={styles.wizardStepNumber}>3</div>
                    <span>Status & Lokasi</span>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  {/* STEP 1: INFORMASI UTAMA */}
                  {formStep === 1 && (
                    <>
                      {/* Nama Properti */}
                      <div className={styles.spanFull}>
                        <label className={styles.filterLabel}>
                          Nama Properti * 
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Nama unik properti komersial atau hunian, misal: Cemara Park Residence Kav A-1</span>
                          </span>
                          {isFieldDirty("namaProperti") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="text"
                          name="namaProperti"
                          placeholder="Masukkan nama properti (misal: Aston Villa Blok A)"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.namaProperti}
                          onChange={handleFormChange}
                        />
                        {formErrors.namaProperti && <div className={styles.inlineError}>{formErrors.namaProperti}</div>}
                      </div>

                      {/* Group Name */}
                      <div>
                        <label className={styles.filterLabel}>
                          Group
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Nama cluster atau kompleks perumahan induk properti ini, misal: Mentari</span>
                          </span>
                          {isFieldDirty("groupName") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="text"
                          name="groupName"
                          placeholder="Masukkan nama group (misal: Mentari)"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.groupName}
                          onChange={handleFormChange}
                        />
                      </div>

                      {/* Tipe */}
                      <div>
                        <label className={styles.filterLabel}>
                          Tipe Properti *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Jenis properti. Ruko untuk komersial bisnis, Villa untuk hunian eksklusif</span>
                          </span>
                          {isFieldDirty("tipe") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <div className={styles.radioGroup} style={{ marginTop: "4px" }}>
                          <label className={styles.radioOption}>
                            <input
                              type="radio"
                              name="tipe"
                              value="RUKO"
                              checked={formData.tipe === "RUKO"}
                              onChange={handleFormChange}
                            />
                            RUKO
                          </label>
                          <label className={styles.radioOption}>
                            <input
                              type="radio"
                              name="tipe"
                              value="VILLA"
                              checked={formData.tipe === "VILLA"}
                              onChange={handleFormChange}
                            />
                            VILLA
                          </label>
                        </div>
                      </div>

                      {/* Harga */}
                      <div className={styles.spanFull}>
                        <label className={styles.filterLabel}>
                          Harga Jual (Rupiah) *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Harga penawaran properti. Masukkan angka saja, akan dikonversi otomatis</span>
                          </span>
                          {isFieldDirty("price") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="text"
                          name="price"
                          placeholder="Harga Jual"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.price}
                          onChange={handleFormPriceChange}
                        />
                        <div style={{ fontSize: "12px", color: "#c9a961", fontWeight: "bold", marginTop: "4px" }}>
                          {formatRupiah(formData.price)}
                        </div>
                        {formErrors.price && <div className={styles.inlineError}>{formErrors.price}</div>}
                      </div>
                    </>
                  )}

                  {/* STEP 2: SPESIFIKASI FISIK */}
                  {formStep === 2 && (
                    <>
                      {/* Lebar */}
                      <div>
                        <label className={styles.filterLabel}>
                          Lebar Properti (meter) *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Lebar bangunan/tanah depan dalam meter, misal: 6</span>
                          </span>
                          {isFieldDirty("lebar") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="lebar"
                          placeholder="Lebar"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.lebar}
                          onChange={handleFormChange}
                        />
                        {formErrors.lebar && <div className={styles.inlineError}>{formErrors.lebar}</div>}
                      </div>

                      {/* Panjang */}
                      <div>
                        <label className={styles.filterLabel}>
                          Panjang Properti (meter) *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Panjang/kedalaman tanah ke belakang dalam meter, misal: 15</span>
                          </span>
                          {isFieldDirty("panjang") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="panjang"
                          placeholder="Panjang"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.panjang}
                          onChange={handleFormChange}
                        />
                        {formErrors.panjang && <div className={styles.inlineError}>{formErrors.panjang}</div>}
                      </div>

                      {/* Tingkat */}
                      <div>
                        <label className={styles.filterLabel}>
                          Jumlah Tingkat (Lantai) *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Jumlah tingkat lantai bangunan, misal: 2 atau 2.5 lantai</span>
                          </span>
                          {isFieldDirty("tingkat") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="tingkat"
                          placeholder="Tingkat"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.tingkat}
                          onChange={handleFormChange}
                        />
                        {formErrors.tingkat && <div className={styles.inlineError}>{formErrors.tingkat}</div>}
                      </div>

                      {/* Carport */}
                      <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                        <label className={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            name="carport"
                            checked={formData.carport}
                            onChange={handleFormChange}
                          />
                          <span className={styles.checkmark}></span>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#2d3748" }}>Memiliki Carport</span>
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Centang jika unit memiliki garasi atau lahan parkir carport terbuka</span>
                          </span>
                        </label>
                      </div>

                      {/* Hadap */}
                      <div className={styles.spanFull}>
                        <label className={styles.checkboxGroupLabel}>
                          Arah Hadap *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Arah hadap utama pintu masuk properti. Bisa pilih lebih dari satu arah</span>
                          </span>
                          {isFieldDirty("hadap") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <div className={styles.checkboxGrid}>
                          {HADAPS.map((dir) => {
                            const isChecked = formData.hadap.includes(dir);
                            return (
                              <label key={dir} className={styles.checkboxItem}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleFormHadapChange(dir)}
                                />
                                {dir}
                              </label>
                            );
                          })}
                        </div>
                        {formErrors.hadap && <div className={styles.inlineError}>{formErrors.hadap}</div>}
                      </div>
                    </>
                  )}

                  {/* STEP 3: STATUS & LOKASI */}
                  {formStep === 3 && (
                    <>
                      {/* Kawasan */}
                      <div className={styles.spanFull}>
                        <label className={styles.checkboxGroupLabel}>
                          Pilih Kawasan *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Kawasan cluster perumahan terdekat atau terdaftar, pilih satu atau lebih</span>
                          </span>
                          {isFieldDirty("kawasan") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <div className={styles.checkboxGrid}>
                          {KAWASANS.map((kw) => {
                            const isChecked = formData.kawasan.includes(kw);
                            return (
                              <label key={kw} className={styles.checkboxItem}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleFormKawasanChange(kw)}
                                />
                                {kw}
                              </label>
                            );
                          })}
                        </div>
                        {formErrors.kawasan && <div className={styles.inlineError}>{formErrors.kawasan}</div>}
                      </div>

                      {/* Kesiapan Unit */}
                      <div>
                        <label className={styles.filterLabel}>
                          Status Kesiapan *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Kondisi unit properti: Siap Huni, Siap Kosong (bare), atau Siap Huni Renovasi</span>
                          </span>
                          {isFieldDirty("siap") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <select
                          name="siap"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.siap}
                          onChange={handleFormChange}
                        >
                          <option value="siap_huni">Siap Huni</option>
                          <option value="siap_kosong">Siap Kosong</option>
                          <option value="siap_huni_renovasi">Siap Huni Renovasi</option>
                        </select>
                      </div>

                      {/* Status Inventory */}
                      <div>
                        <label className={styles.filterLabel}>
                          Status Inventory *
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Status ketersediaan: In Stock (Tersedia dijual) / Sold Out (Sudah Terjual)</span>
                          </span>
                          {isFieldDirty("status") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <select
                          name="status"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.status}
                          onChange={handleFormChange}
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="sold_out">Sold Out</option>
                        </select>
                      </div>

                      {/* Google Maps Link */}
                      <div className={styles.spanFull}>
                        <label className={styles.filterLabel}>
                          Link Google Maps
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Tautan pin lokasi koordinat Google Maps untuk memvalidasi lokasi unit</span>
                          </span>
                          {isFieldDirty("mapsLink") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="text"
                          name="mapsLink"
                          placeholder="Masukkan link Google Maps (misal: https://google.com/maps/place/...)"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.mapsLink}
                          onChange={handleFormChange}
                        />
                        {formErrors.mapsLink && <div className={styles.inlineError}>{formErrors.mapsLink}</div>}
                      </div>

                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                          Latitude
                          {isFieldDirty("lat") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="number"
                          name="lat"
                          step="any"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.lat}
                          onChange={handleFormChange}
                        />
                      </div>

                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                          Longitude
                          {isFieldDirty("lng") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="number"
                          name="lng"
                          step="any"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.lng}
                          onChange={handleFormChange}
                        />
                      </div>

                      {/* Unit */}
                      <div className={styles.spanFull}>
                        <label className={styles.filterLabel}>
                          Informasi Unit (Catatan)
                          <span className={styles.tooltipWrapper}>
                            <Info size={14} />
                            <span className={styles.tooltipText}>Catatan tambahan kondisi lapangan unit, misal: Hook unit, Gate siap</span>
                          </span>
                          {isFieldDirty("unit") && <span className={styles.dirtyIndicator}><span className={styles.dirtyDot}></span>(Diubah)</span>}
                        </label>
                        <input
                          type="text"
                          name="unit"
                          placeholder="Masukkan catatan unit (misal: Ready Hook)"
                          className={styles.filterInput}
                          style={{ width: "100%", marginTop: "4px" }}
                          value={formData.unit}
                          onChange={handleFormChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Wizard Form Modal Footer Controls */}
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
                  {formStep > 1 && (
                    <button 
                      type="button" 
                      className={styles.btnCancel} 
                      style={{ marginRight: 0 }} 
                      onClick={() => setFormStep(prev => prev - 1)}
                      disabled={isSubmitting}
                    >
                      Sebelumnya
                    </button>
                  )}
                  {formStep < 3 ? (
                    <button 
                      type="button" 
                      className={styles.btnSave} 
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                    >
                      Berikutnya
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      {formMode === "create" && (
                        <button 
                          type="button" 
                          className={styles.btnSave} 
                          style={{ backgroundColor: "#2d3748", borderColor: "#2d3748", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={(e) => handleFormSubmit(e, true)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                          Simpan & Tambah Lagi
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className={styles.btnSave}
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                        {isSubmitting ? "Memproses..." : (formMode === "create" ? "Simpan Properti" : "Simpan Perubahan")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedProperty && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.modalHeader} style={{ backgroundColor: "#b33a3a" }}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><AlertTriangle size={18} /> Konfirmasi Penghapusan</span>
              </h2>
              <button className={styles.iconBtn} onClick={() => setIsDeleteOpen(false)}><X size={16} /></button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.deleteWarningText}>
                Yakin hapus properti <strong>&ldquo;{selectedProperty.namaProperti}&rdquo;</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                type="button" 
                className={styles.btnDeleteConfirm} 
                onClick={handleDeleteConfirm}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Properti"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT ADMIN MODAL */}
      {isAdminFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {adminFormMode === "create" ? <Plus size={18} /> : <Pencil size={18} />}
                  {adminFormMode === "create" ? "Buat Akun Admin Baru" : "Edit Akun Admin"}
                </span>
              </h2>
              <button 
                className={styles.iconBtn}
                onClick={() => setIsAdminFormOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAdminSubmit}>
              <div className={styles.modalBody}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className={styles.filterLabel}>Nama Lengkap (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama admin"
                      className={styles.filterInput}
                      style={{ width: "100%", marginTop: "4px" }}
                      value={adminFormData.nama}
                      onChange={(e) => setAdminFormData({ ...adminFormData, nama: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={styles.filterLabel}>Email Admin *</label>
                    <input
                      type="email"
                      placeholder="Masukkan alamat email (contoh: budi@primeproperty.com)"
                      className={styles.filterInput}
                      style={{ width: "100%", marginTop: "4px" }}
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    />
                    {adminFormErrors.email && <div className={styles.inlineError}>{adminFormErrors.email}</div>}
                  </div>

                  <div>
                    <label className={styles.filterLabel}>Peran (Role) *</label>
                    <select
                      className={styles.filterInput}
                      style={{ width: "100%", marginTop: "4px" }}
                      value={adminFormData.role}
                      onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                    >
                      {permissionsMatrix ? Object.keys(permissionsMatrix).map(rKey => (
                        <option key={rKey} value={rKey}>{rKey}</option>
                      )) : (
                        <>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPERADMIN">SUPERADMIN</option>
                        </>
                      )}
                    </select>
                  </div>

                  {adminFormMode === "create" ? (
                    <div>
                      <label className={styles.filterLabel}>Password Sementara *</label>
                      <input
                        type="password"
                        placeholder="Masukkan password minimal 8 karakter (kombinasi huruf besar, kecil, angka, simbol)"
                        className={styles.filterInput}
                        style={{ width: "100%", marginTop: "4px" }}
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      />
                      {adminFormErrors.password && <div className={styles.inlineError}>{adminFormErrors.password}</div>}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <input
                          type="checkbox"
                          id="adminIsActive"
                          className={styles.customTableCheckbox}
                          checked={adminFormData.isActive}
                          onChange={(e) => setAdminFormData({ ...adminFormData, isActive: e.target.checked })}
                        />
                        <label htmlFor="adminIsActive" className={styles.filterLabel} style={{ cursor: "pointer", margin: 0 }}>
                          Akun Admin Aktif (Dapat Login)
                        </label>
                      </div>
                    </>
                  )}
                  
                  {adminFormMode === "create" && (
                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                      💡 Admin baru akan diwajibkan mengganti password sementara ini pada login pertama mereka.
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => setIsAdminFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                  {isSubmitting ? "Memproses..." : (adminFormMode === "create" ? "Buat Akun" : "Simpan Perubahan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD ADMIN MODAL */}
      {isResetPasswordOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Key size={18} /> Reset Password Admin</span>
              </h2>
              <button 
                className={styles.iconBtn}
                onClick={() => setIsResetPasswordOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleResetAdminPasswordSubmit}>
              <div className={styles.modalBody}>
                {resetSuccessMessage ? (
                  <div style={{ padding: "12px", backgroundColor: "#e2f7ed", color: "#1b8a5a", borderRadius: "6px", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={18} /> {resetSuccessMessage}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label className={styles.filterLabel}>Password Baru Admin *</label>
                      <input
                        type="password"
                        placeholder="Masukkan password minimal 8 karakter (kombinasi huruf besar, kecil, angka, simbol)"
                        className={styles.filterInput}
                        style={{ width: "100%", marginTop: "4px" }}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                      />
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                      💡 Mereset password akan memaksa logout akun tersebut dari semua perangkat aktifnya, dan mewajibkan mereka menyetel password baru pada login berikutnya.
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => setIsResetPasswordOpen(false)}
                  disabled={isSubmitting}
                >
                  {resetSuccessMessage ? "Tutup" : "Batal"}
                </button>
                {!resetSuccessMessage && (
                  <button 
                    type="submit" 
                    className={styles.btnSubmit}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                    {isSubmitting ? "Memproses..." : "Reset Password"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL FOR ADMIN */}
      {isDeleteAdminOpen && adminToDelete && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.deleteModal}`}>
            <div className={styles.modalHeader} style={{ backgroundColor: "#b33a3a" }}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><AlertTriangle size={18} /> Konfirmasi Hapus Admin</span>
              </h2>
              <button className={styles.iconBtn} onClick={() => setIsDeleteAdminOpen(false)}><X size={16} /></button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteWarningText}>
                Apakah Anda yakin ingin menghapus akun admin <strong>{adminToDelete.email}</strong> secara permanen?
              </p>
              <p style={{ color: "#666", fontSize: "14px", margin: "8px 0 0 0" }}>
                Tindakan ini akan menghapus seluruh data sesi aktif admin ini dan tidak dapat dibatalkan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={() => setIsDeleteAdminOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                type="button" 
                className={styles.btnDeleteConfirm} 
                onClick={handleDeleteAdminConfirm}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                {isSubmitting ? "Menghapus..." : "Ya, Hapus Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {isImportOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <FileUp size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Import Properti via Excel
              </h2>
              <button 
                className={styles.iconBtn} 
                onClick={() => {
                  setIsImportOpen(false);
                  setCsvFile(null);
                  setImportError("");
                  setImportSuccess("");
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleExcelImportSubmit}>
              <div className={styles.modalBody}>
                {importSuccess && (
                  <div style={{ padding: "12px", backgroundColor: "#e2f7ed", color: "#1b8a5a", borderRadius: "6px", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={18} /> {importSuccess}
                    </span>
                  </div>
                )}
                {importError && (
                  <div style={{ padding: "12px", backgroundColor: "#fdf2f2", color: "#b33a3a", borderRadius: "6px", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={18} /> {importError}
                    </span>
                  </div>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ fontSize: "13px", color: "#4a5568", margin: 0 }}>
                    Unggah file Excel Anda (.xlsx atau .xls) untuk mengimpor properti secara massal. Pastikan file memiliki format header yang benar.
                  </p>
                  
                  {/* Drag-and-drop or select file area */}
                  <div 
                    className={styles.fileUploadArea}
                    onClick={() => document.getElementById("excelFileInput").click()}
                  >
                    <FileUp className={styles.uploadIcon} size={32} />
                    {csvFile ? (
                      <span className={styles.selectedFileName}>
                        📄 {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#718096" }}>
                        Klik di sini untuk memilih file Excel Anda
                      </span>
                    )}
                    <input
                      id="excelFileInput"
                      type="file"
                      accept=".xlsx, .xls"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCsvFile(file);
                          setImportError("");
                          setImportSuccess("");
                        }
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-8px" }}>
                    <span style={{ fontSize: "11px", color: "#718096" }}>Belum punya format template?</span>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c9a961",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0
                      }}
                    >
                      Unduh Template Excel
                    </button>
                  </div>
                  
                  {/* Template description and headers */}
                  <div className={styles.importTemplateBox}>

                    <div className={styles.templateTitle}>FORMAT HEADER YANG DIKANDUNG (Bisa pilih salah satu format):</div>
                    <div className={styles.templateHeaders} style={{ fontSize: "11px", wordBreak: "break-all" }}>
                      <strong>Format Schema</strong>: namaProperti, groupName, lebar, panjang, hadap, tipe, tingkat, price, carport, status, siap, mapsLink, kawasan, unit
                    </div>
                    <div className={styles.templateHeaders} style={{ fontSize: "11px", marginTop: "6px", wordBreak: "break-all" }}>
                      <strong>Format Kolom Ekspor</strong>: Nama, Group, Lebar (m), Panjang (m), Hadap, Tipe, Tingkat, Harga, Carport, Status, Kesiapan, Kawasan, Catatan, Link Maps
                    </div>
                    <ul style={{ fontSize: "11px", color: "#718096", marginTop: "8px", paddingLeft: "16px", margin: "8px 0 0 0" }}>
                      <li><strong>Hadap / Kawasan</strong>: Jika lebih dari satu, pisahkan dengan titik koma (<code>;</code>) atau koma (<code>,</code>).</li>
                      <li><strong>Carport</strong>: Gunakan <code>true</code> atau <code>Ya</code>, selain itu dianggap <code>false</code>.</li>
                      <li><strong>Tipe</strong>: Gunakan <code>RUKO</code> atau <code>VILLA</code>.</li>
                      <li><strong>Status</strong>: Gunakan <code>in_stock</code> / <code>Tersedia</code> atau <code>sold_out</code> / <code>Terjual</code>.</li>
                      <li><strong>Kesiapan</strong>: Gunakan <code>Siap Huni</code>, <code>Siap Kosong</code>, atau <code>Siap Huni Renovasi</code>.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.btnCancel} 
                  onClick={() => {
                    setIsImportOpen(false);
                    setCsvFile(null);
                    setImportError("");
                    setImportSuccess("");
                  }}
                  disabled={importLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  disabled={importLoading || !csvFile}
                >
                  {importLoading ? "Mengimpor..." : "Mulai Import Excel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERIC CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 11000 }}>
          <div className={`${styles.modal} ${styles.deleteModal}`} style={{ maxWidth: "450px" }}>
            <div className={styles.modalHeader} style={{ 
              backgroundColor: confirmModal.type === "danger" ? "#b33a3a" : 
                               confirmModal.type === "success" ? "#1b8a5a" : "#1a1a1a" 
            }}>
              <h2 className={styles.modalTitle} style={{ color: "#ffffff", border: "none", margin: 0, padding: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {confirmModal.type === "danger" ? <AlertTriangle size={18} /> : <Check size={18} />}
                  {confirmModal.title}
                </span>
              </h2>
              <button 
                className={styles.iconBtn} 
                onClick={() => !isSubmitting && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, lineHeight: "1.5", color: "#2d3748" }}>{confirmModal.message}</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={isSubmitting}
              >
                {confirmModal.cancelText}
              </button>
              <button 
                type="button" 
                className={confirmModal.type === "danger" ? styles.btnDeleteConfirm : styles.btnSave}
                style={{ 
                  backgroundColor: confirmModal.type === "success" ? "#1b8a5a" : undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onClick={confirmModal.onConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className={styles.spinner} style={{ width: "14px", height: "14px", borderTopColor: "transparent" }}></span>}
                {isSubmitting ? "Memproses..." : confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

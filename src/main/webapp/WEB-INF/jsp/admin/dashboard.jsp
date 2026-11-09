<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Super Admin - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
            <h1 class="h2 fw-bold mb-1">Super Administrator Control Center</h1>
            <p class="text-muted small mb-0">Platform governance, user management, and security audit logs.</p>
        </div>
        <span class="badge bg-purple text-white p-2">Platform Master Role</span>
    </div>

    <!-- KPI Summary Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-white">
                <span class="text-muted small">Total Platform Users</span>
                <h3 class="fw-bold font-mono text-primary mb-0">${totalUsers}</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-white">
                <span class="text-muted small">Total Workshops</span>
                <h3 class="fw-bold font-mono text-dark mb-0">${totalWorkshops}</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-white">
                <span class="text-muted small">Total Bookings</span>
                <h3 class="fw-bold font-mono text-success mb-0">${totalRegistrations}</h3>
            </div>
        </div>
    </div>

    <!-- Audit Logs -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3">
            <h5 class="card-title fw-bold mb-0">Recent Platform Audit Activity</h5>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light text-uppercase text-secondary">
                    <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="log" items="${auditLogs}">
                        <tr>
                            <td class="font-mono text-muted">${log.createdAt}</td>
                            <td class="fw-semibold">${log.actorName}</td>
                            <td><span class="badge bg-light text-dark border font-mono">${log.action}</span></td>
                            <td>${log.shortDescription}</td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

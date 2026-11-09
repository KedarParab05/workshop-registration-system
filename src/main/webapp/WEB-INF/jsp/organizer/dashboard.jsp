<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Organizer Studio - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
            <h1 class="h2 fw-bold mb-1">Faculty & Organizer Studio</h1>
            <p class="text-muted small mb-0">Create new academic sessions and monitor attendee registration counts.</p>
        </div>
        <div class="d-flex gap-2">
            <a href="${pageContext.request.contextPath}/organizer/registrations" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> View Attendees
            </a>
            <a href="${pageContext.request.contextPath}/organizer/workshops/create" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle me-1"></i> Create Workshop
            </a>
        </div>
    </div>

    <!-- Workshop List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3">
            <h5 class="card-title fw-bold mb-0">Your Hosted Sessions</h5>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light small text-uppercase text-secondary">
                    <tr>
                        <th>Workshop Title</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="ws" items="${workshops}">
                        <tr>
                            <td>
                                <div class="fw-bold text-dark">${ws.title}</div>
                                <small class="text-muted">${ws.venue}</small>
                            </td>
                            <td><span class="badge bg-light text-dark border">${ws.category}</span></td>
                            <td class="small font-mono text-muted">${ws.date} (${ws.startTime})</td>
                            <td class="font-mono fw-semibold">${ws.capacity}</td>
                            <td>
                                <span class="badge ${ws.status == 'PUBLISHED' ? 'bg-success' : 'bg-warning'}">
                                    ${ws.status}
                                </span>
                            </td>
                            <td class="text-end">
                                <a href="${pageContext.request.contextPath}/workshops/${ws.id}" class="btn btn-outline-primary btn-sm">View</a>
                                <form action="${pageContext.request.contextPath}/organizer/workshops/${ws.id}/delete" method="post" class="d-inline"
                                      onsubmit="return confirm('Confirm workshop deletion or cancellation?');">
                                    <button type="submit" class="btn btn-outline-danger btn-sm">Delete</button>
                                </form>
                            </td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

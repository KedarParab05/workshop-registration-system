<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="My Registrations - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
            <h1 class="h2 fw-bold mb-1">My Workshop Registrations</h1>
            <p class="text-muted small mb-0">Review your enrolled workshops and manage seat cancellations.</p>
        </div>
        <a href="${pageContext.request.contextPath}/workshops" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> Register for More
        </a>
    </div>

    <c:choose>
        <c:when test="${empty registrations}">
            <div class="text-center py-5 bg-white border rounded">
                <i class="bi bi-calendar-check text-muted display-4"></i>
                <h4 class="mt-3 fw-bold">No Registrations Yet</h4>
                <p class="text-muted small">You haven't registered for any workshops. Browse upcoming sessions to claim your free seat.</p>
                <a href="${pageContext.request.contextPath}/workshops" class="btn btn-outline-primary btn-sm">Explore Workshops</a>
            </div>
        </c:when>
        <c:otherwise>
            <div class="card shadow-sm border-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase text-secondary">
                            <tr>
                                <th>Registration ID</th>
                                <th>Workshop ID</th>
                                <th>Booked Date</th>
                                <th>Status</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="reg" items="${registrations}">
                                <tr>
                                    <td class="font-mono small">${reg.id}</td>
                                    <td>
                                        <a href="${pageContext.request.contextPath}/workshops/${reg.workshopId}" class="fw-semibold text-decoration-none">
                                            Workshop #${reg.workshopId}
                                        </a>
                                    </td>
                                    <td class="small text-muted font-mono">${reg.registeredAt}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${reg.status == 'CONFIRMED'}">
                                                <span class="badge bg-success-subtle text-success border border-success-subtle">Confirmed</span>
                                            </c:when>
                                            <c:otherwise>
                                                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Cancelled</span>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td class="text-end">
                                        <c:if test="${reg.status == 'CONFIRMED'}">
                                            <form action="${pageContext.request.contextPath}/registrations/${reg.id}/cancel" method="post" class="d-inline"
                                                  onsubmit="return confirm('Are you sure you want to cancel this registration? Your seat will be restored for other participants.');">
                                                <button type="submit" class="btn btn-outline-danger btn-sm">Cancel Seat</button>
                                            </form>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
            </div>
        </c:otherwise>
    </c:choose>
</div>

<jsp:include page="../common/footer.jsp" />

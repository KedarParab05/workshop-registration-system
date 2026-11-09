<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="${workshop.title} - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <a href="${pageContext.request.contextPath}/workshops" class="btn btn-link text-decoration-none p-0 mb-3 text-secondary small">
        <i class="bi bi-arrow-left"></i> Back to Workshop Catalog
    </a>

    <div class="row g-4">
        <!-- Main Workshop Content -->
        <div class="col-lg-8">
            <div class="card overflow-hidden mb-4 shadow-sm">
                <img src="${workshop.bannerImageUrl}" class="w-100 object-fit-cover" style="height: 320px;" alt="${workshop.title}"
                     onerror="this.src='${pageContext.request.contextPath}/assets/images/banner_fullstack_web_1793237230200.jpg'">
                <div class="card-body p-4">
                    <div class="text-muted small mb-2">
                        <span class="text-primary fw-bold">${workshop.category}</span> · Led by ${workshop.organizerNameSnapshot}
                    </div>
                    <h1 class="h3 fw-bold mb-3">${workshop.title}</h1>
                    <p class="text-secondary leading-relaxed mb-4">${workshop.summary}</p>

                    <div class="row g-3 p-3 bg-light rounded border mb-4">
                        <div class="col-sm-6">
                            <span class="text-muted small">Date & Time</span>
                            <div class="fw-bold"><i class="bi bi-calendar text-primary me-1"></i> ${workshop.date}</div>
                            <small class="text-secondary">${workshop.startTime} to ${workshop.endTime}</small>
                        </div>
                        <div class="col-sm-6">
                            <span class="text-muted small">Location</span>
                            <div class="fw-bold">
                                <c:choose>
                                    <c:when test="${workshop.onlineMode}"><i class="bi bi-camera-video text-info me-1"></i> Online Video Session</c:when>
                                    <c:otherwise><i class="bi bi-geo-alt text-danger me-1"></i> In-Person Campus</c:otherwise>
                                </c:choose>
                            </div>
                            <small class="text-secondary text-truncate d-block">${workshop.venue}</small>
                        </div>
                    </div>

                    <h5 class="fw-bold mb-2">About this Session</h5>
                    <p class="text-secondary mb-4 leading-relaxed">${workshop.description}</p>

                    <c:if test="${not empty workshop.learningOutcomes}">
                        <h5 class="fw-bold mb-2">Learning Outcomes</h5>
                        <ul class="list-group list-group-flush mb-4">
                            <c:forEach var="item" items="${workshop.learningOutcomes}">
                                <li class="list-group-item bg-transparent px-0 py-1 small">
                                    <i class="bi bi-check2-circle text-success me-2"></i> ${item}
                                </li>
                            </c:forEach>
                        </ul>
                    </c:if>

                    <div class="border-top pt-3">
                        <small class="text-muted">Faculty / Organizer: <strong>${workshop.organizerNameSnapshot}</strong></small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Registration Card -->
        <div class="col-lg-4">
            <div class="card p-4 shadow-sm sticky-top" style="top: 80px;">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                    <div>
                        <span class="h3 fw-bold mb-0 text-success">FREE</span>
                        <div class="small text-muted">100% Free Admission</div>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block">Deadline</small>
                        <span class="small fw-semibold">${workshop.registrationDeadline}</span>
                    </div>
                </div>

                <!-- Seat Capacity -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Capacity</span>
                        <span class="font-mono"><strong>${attendeeCount}</strong> / ${workshop.capacity} seats</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar ${isFull ? 'bg-danger' : 'bg-primary'}" role="progressbar"
                             style="width: ${(attendeeCount / workshop.capacity) * 100}%"></div>
                    </div>
                    <small class="d-block mt-1 font-mono text-end ${isFull ? 'text-danger fw-bold' : 'text-success'}">
                        ${isFull ? "Fully Booked (0 seats left)" : availableSeats.toString().concat(" seats remaining")}
                    </small>
                </div>

                <!-- Free Registration Form -->
                <c:choose>
                    <c:when test="${isFull}">
                        <div class="alert alert-warning small text-center mb-0">
                            <i class="bi bi-exclamation-circle me-1"></i> Registration is closed because all seats are filled.
                        </div>
                    </c:when>
                    <c:otherwise>
                        <form action="${pageContext.request.contextPath}/workshops/${workshop.id}/register" method="post">
                            <div class="mb-3">
                                <label class="form-label small fw-semibold">Note for Organizer (Optional):</label>
                                <textarea name="notes" class="form-control form-control-sm" rows="2" placeholder="Topics you'd like to cover..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                                Register for Free
                            </button>
                        </form>
                    </c:otherwise>
                </c:choose>

                <div class="border-top pt-3 mt-3 text-muted small">
                    <i class="bi bi-shield-check text-success me-1"></i> Instant confirmation & cancellation allowed.
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

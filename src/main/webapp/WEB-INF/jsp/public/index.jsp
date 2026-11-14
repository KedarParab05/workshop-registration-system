<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Learn. Build. Grow. - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="bg-dark text-white py-5 mb-5">
    <div class="container py-lg-4">
        <div class="row align-items-center g-5">
            <div class="col-lg-7">
                <span class="badge bg-primary mb-3">Academic Workshop Portal</span>
                <h1 class="display-4 fw-bold mb-3">Learn. Build. Grow.</h1>
                <p class="lead text-white-50 mb-4">
                    Explore university technical masterclasses and academic sessions.
                    Registration is 100% free with automated seat tracking and role-based permissions.
                </p>
                <form action="${pageContext.request.contextPath}/workshops" method="get" class="d-flex gap-2 max-w-lg mb-3">
                    <input type="text" name="q" class="form-control" placeholder="Search workshops by topic or speaker...">
                    <button type="submit" class="btn btn-primary px-4 text-nowrap">Find Workshops</button>
                </form>
                <div class="d-flex gap-3 small text-white-50">
                    <a href="${pageContext.request.contextPath}/workshops" class="text-white text-decoration-none">
                        Browse All Sessions <i class="bi bi-arrow-right"></i>
                    </a>
                    <span>·</span>
                    <a href="${pageContext.request.contextPath}/viva-guide" class="text-info text-decoration-none">
                        <i class="bi bi-book"></i> Viva Exam Guide
                    </a>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card bg-secondary border-0 overflow-hidden shadow-lg">
                    <img src="${pageContext.request.contextPath}/assets/images/workshop-collaboration-hero.jpg"
                         class="card-img-top object-fit-cover"
                         style="height: 320px;"
                         alt="Academic Workshop Session"
                         onerror="this.src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'">
                    <div class="card-body bg-dark text-white p-3">
                        <h6 class="mb-0 fw-bold">Interactive CS Innovation Labs</h6>
                        <small class="text-white-50">Direct mentor guidance with live seat reservations.</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="h3 fw-bold mb-0">Featured Upcoming Sessions</h2>
            <p class="text-muted small mb-0">Hands-on technical workshops led by academic faculty.</p>
        </div>
        <a href="${pageContext.request.contextPath}/workshops" class="btn btn-outline-primary btn-sm">
            View All Workshops <i class="bi bi-arrow-right"></i>
        </a>
    </div>

    <div class="row g-4">
        <c:forEach var="ws" items="${featuredWorkshops}">
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${ws.bannerImageUrl}" class="card-img-top object-fit-cover" style="height: 180px;" alt="${ws.title}"
                             onerror="this.src='${pageContext.request.contextPath}/assets/images/fullstack-web-workshop-banner.jpg'">
                        <span class="badge bg-dark position-absolute top-0 end-0 m-2">100% Free</span>
                    </div>
                    <div class="card-body d-flex flex-col justify-content-between">
                        <div>
                            <div class="text-muted small mb-1">
                                <span class="text-primary fw-semibold">${ws.category}</span> · By ${ws.organizerNameSnapshot}
                            </div>
                            <h5 class="card-title fw-bold text-truncate">${ws.title}</h5>
                            <p class="card-text small text-secondary">${ws.summary}</p>
                            <div class="small text-muted mb-3 border-top pt-2">
                                <i class="bi bi-calendar me-1"></i> ${ws.date} (${ws.startTime} - ${ws.endTime})<br>
                                <i class="bi bi-geo-alt me-1"></i> ${ws.venue}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                            <span class="small text-muted font-mono"><strong class="text-dark">${ws.capacity}</strong> seats total</span>
                            <a href="${pageContext.request.contextPath}/workshops/${ws.id}" class="btn btn-outline-primary btn-sm">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </c:forEach>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

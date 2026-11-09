<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Explore Workshops - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
            <h1 class="h2 fw-bold mb-1">Explore Academic Workshops</h1>
            <p class="text-muted small mb-0">Browse published sessions and reserve your seat for free.</p>
        </div>
        <span class="badge bg-light text-dark border p-2 small">
            <i class="bi bi-shield-check text-success me-1"></i> All Workshops 100% Free
        </span>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card p-3 mb-4 bg-white shadow-sm">
        <form action="${pageContext.request.contextPath}/workshops" method="get" class="row g-2 align-items-center">
            <div class="col-md-7">
                <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
                    <input type="text" name="q" value="${searchQuery}" class="form-control" placeholder="Search by topic, keyword, or speaker...">
                </div>
            </div>
            <div class="col-md-3">
                <select name="category" class="form-select">
                    <option value="All" ${selectedCategory == 'All' ? 'selected' : ''}>All Categories</option>
                    <option value="Web Development" ${selectedCategory == 'Web Development' ? 'selected' : ''}>Web Development</option>
                    <option value="Artificial Intelligence" ${selectedCategory == 'Artificial Intelligence' ? 'selected' : ''}>Artificial Intelligence</option>
                    <option value="Cloud Computing" ${selectedCategory == 'Cloud Computing' ? 'selected' : ''}>Cloud Computing</option>
                    <option value="Cybersecurity" ${selectedCategory == 'Cybersecurity' ? 'selected' : ''}>Cybersecurity</option>
                    <option value="Software Engineering" ${selectedCategory == 'Software Engineering' ? 'selected' : ''}>Software Engineering</option>
                </select>
            </div>
            <div class="col-md-2 d-grid">
                <button type="submit" class="btn btn-primary">Filter</button>
            </div>
        </form>
    </div>

    <!-- Workshop Cards Grid -->
    <c:choose>
        <c:when test="${empty workshops}">
            <div class="text-center py-5 bg-white border rounded">
                <i class="bi bi-calendar-x text-muted display-4"></i>
                <h4 class="mt-3 fw-bold">No Workshops Found</h4>
                <p class="text-muted small">No upcoming workshops matched your search criteria.</p>
                <a href="${pageContext.request.contextPath}/workshops" class="btn btn-outline-secondary btn-sm">Reset Filters</a>
            </div>
        </c:when>
        <c:otherwise>
            <div class="row g-4">
                <c:forEach var="ws" items="${workshops}">
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="${ws.bannerImageUrl}" class="card-img-top object-fit-cover" style="height: 180px;" alt="${ws.title}"
                                     onerror="this.src='${pageContext.request.contextPath}/assets/images/banner_fullstack_web_1793237230200.jpg'">
                                <span class="badge bg-dark position-absolute top-0 start-0 m-2">Free</span>
                                <c:if test="${ws.status == 'DRAFT'}">
                                    <span class="badge bg-warning position-absolute top-0 end-0 m-2">DRAFT</span>
                                </c:if>
                            </div>
                            <div class="card-body d-flex flex-column justify-content-between">
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
                                    <span class="small text-muted font-mono"><strong class="text-dark">${ws.capacity}</strong> seats</span>
                                    <a href="${pageContext.request.contextPath}/workshops/${ws.id}" class="btn btn-outline-primary btn-sm">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </c:forEach>
            </div>
        </c:otherwise>
    </c:choose>
</div>

<jsp:include page="../common/footer.jsp" />

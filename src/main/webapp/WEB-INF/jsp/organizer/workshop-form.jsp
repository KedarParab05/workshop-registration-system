<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Create Workshop - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card p-4 shadow-sm border-0">
                <h3 class="fw-bold mb-1">Create Academic Workshop</h3>
                <p class="text-muted small mb-4">All workshops on WorkshopHub are free for students. Configure session capacity and schedule.</p>

                <form action="${pageContext.request.contextPath}/organizer/workshops/create" method="post" enctype="multipart/form-data">
                    <div class="row g-3 mb-3">
                        <div class="col-md-8">
                            <label class="form-label small fw-semibold">Workshop Title *</label>
                            <input type="text" name="title" class="form-control" required placeholder="e.g. Distributed Cloud Systems">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Category *</label>
                            <select name="category" class="form-select">
                                <option value="Web Development">Web Development</option>
                                <option value="Artificial Intelligence">Artificial Intelligence</option>
                                <option value="Cloud Computing">Cloud Computing</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Software Engineering">Software Engineering</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Short Summary *</label>
                        <input type="text" name="summary" class="form-control" required placeholder="1-2 sentences overview">
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Full Description *</label>
                        <textarea name="description" class="form-control" rows="3" required placeholder="Detailed session syllabus..."></textarea>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Session Date *</label>
                            <input type="date" name="date" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Start Time *</label>
                            <input type="time" name="startTime" class="form-control" value="10:00" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">End Time *</label>
                            <input type="time" name="endTime" class="form-control" value="13:00" required>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Max Participant Capacity *</label>
                            <input type="number" name="capacity" class="form-control" min="1" max="500" value="30" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Registration Deadline</label>
                            <input type="date" name="registrationDeadline" class="form-control">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Campus Venue or Online URL</label>
                        <input type="text" name="venue" class="form-control" placeholder="Turing Hall CS-301 or Meet Link" required>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small fw-semibold">Banner Image</label>
                        <input type="file" name="bannerFile" class="form-control" accept="image/*">
                        <small class="text-muted">Select an image banner for the workshop (JPEG, PNG, WebP).</small>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <a href="${pageContext.request.contextPath}/organizer/dashboard" class="btn btn-outline-secondary">Cancel</a>
                        <button type="submit" class="btn btn-primary px-4 fw-semibold">Create Workshop</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

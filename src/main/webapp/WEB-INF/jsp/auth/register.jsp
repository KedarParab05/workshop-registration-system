<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Create Account - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow-sm p-4">
                <h3 class="fw-bold mb-1 text-center">Create Free Account</h3>
                <p class="text-muted small text-center mb-4">Join as a student participant or faculty organizer</p>

                <form action="${pageContext.request.contextPath}/register" method="post">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Full Name</label>
                        <input type="text" name="fullName" class="form-control" required placeholder="e.g. Taylor Smith">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Campus Email</label>
                        <input type="email" name="email" class="form-control" required placeholder="taylor@student.edu">
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Role</label>
                            <select name="role" class="form-select">
                                <option value="PARTICIPANT">Participant (Student)</option>
                                <option value="ORGANIZER">Organizer (Faculty)</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Department</label>
                            <input type="text" name="department" class="form-control" placeholder="Computer Science">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control" required minlength="6" placeholder="Min 6 characters">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Complete Registration</button>
                </form>

                <div class="text-center mt-3 small text-muted">
                    Already registered? <a href="${pageContext.request.contextPath}/login">Sign In</a>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

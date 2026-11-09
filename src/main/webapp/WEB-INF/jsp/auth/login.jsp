<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Sign In - WorkshopHub" />
<jsp:include page="../common/header.jsp" />

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card shadow-sm p-4">
                <h3 class="fw-bold mb-1 text-center">Sign In</h3>
                <p class="text-muted small text-center mb-4">Access your workshop dashboard and bookings</p>

                <!-- Demo Login Personas for Viva Exam -->
                <div class="bg-light p-3 rounded border mb-4 small">
                    <span class="fw-bold d-block mb-1">Demo Accounts for Evaluation:</span>
                    <ul class="list-unstyled mb-0 font-mono text-muted" style="font-size: 11px;">
                        <li>Participant: <strong>alex@student.edu</strong> / Student123!</li>
                        <li>Organizer: <strong>sarah@faculty.edu</strong> / Faculty123!</li>
                        <li>Super Admin: <strong>admin@workshophub.edu</strong> / AdminPass123!</li>
                    </ul>
                </div>

                <form action="${pageContext.request.contextPath}/login-process" method="post">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Email Address</label>
                        <input type="email" name="username" class="form-control" required placeholder="name@campus.edu">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Sign In</button>
                </form>

                <div class="text-center mt-3 small text-muted">
                    Don't have an account? <a href="${pageContext.request.contextPath}/register">Register for free</a>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="../common/footer.jsp" />

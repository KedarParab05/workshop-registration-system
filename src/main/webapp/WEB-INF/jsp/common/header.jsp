<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle != null ? pageTitle : "WorkshopHub - Academic Workshop Platform"}</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-warm: #F5F8EF;
            --color-forest: #08482D;
            --color-mint: #DAE7C7;
            --color-sage: #E8F0DF;
            --color-border: #DCE4D6;
            --color-ink: #101410;
        }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-warm); color: var(--color-ink); }
        h1, h2, h3, h4, .font-heading { font-family: 'Inter Tight', sans-serif; font-weight: 700; }
        .font-hand { font-family: 'Caveat', cursive; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .navbar-brand { font-family: 'Inter Tight', sans-serif; font-weight: 800; letter-spacing: -0.03em; color: var(--color-forest) !important; }
        .btn-primary { background-color: var(--color-forest); border-color: var(--color-forest); color: #ffffff; font-weight: 600; }
        .btn-primary:hover { background-color: #0c5c3b; border-color: #0c5c3b; color: #ffffff; }
        .btn-mint { background-color: var(--color-mint); color: var(--color-forest); font-weight: 700; border: none; }
        .btn-mint:hover { background-color: #c9ddb0; color: var(--color-forest); }
        .card { border-radius: 1rem; border: 1px solid var(--color-border); background-color: #ffffff; }
        .badge-mint { background-color: var(--color-mint); color: var(--color-forest); font-weight: 700; }
        .top-banner { background-color: var(--color-forest); color: #ffffff; }
    </style>
</head>
<body class="d-flex flex-column min-vh-100">

<!-- Academic Session Top Banner -->
<div class="top-banner py-1 px-3 text-center small d-flex justify-content-between align-items-center">
    <span><i class="bi bi-mortarboard me-1"></i><strong>WorkshopHub</strong> — Academic Workshop & Governance Platform</span>
    <span class="badge badge-mint px-2 py-1">100% Free Sessions</span>
</div>

<!-- Navigation Top Bar Contract -->
<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2.5">
    <div class="container-fluid px-lg-5">
        <a class="navbar-brand d-flex align-items-center gap-2" href="${pageContext.request.contextPath}/home">
            <span class="p-1 rounded-circle" style="background-color: var(--color-sage);"><i class="bi bi-flower1" style="color: var(--color-forest); font-size: 1.2rem;"></i></span>
            <span>WorkshopHub</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                <li class="nav-item">
                    <a class="nav-link fw-semibold" href="${pageContext.request.contextPath}/workshops">Explore Workshops</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link fw-semibold" href="${pageContext.request.contextPath}/my-registrations">My Registrations</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link fw-semibold" href="${pageContext.request.contextPath}/organizer/dashboard">Organizer Studio</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link fw-semibold" href="${pageContext.request.contextPath}/admin/dashboard">Super Admin</a>
                </li>
            </ul>
            <div class="d-flex align-items-center gap-2">
                <a href="${pageContext.request.contextPath}/login" class="btn btn-outline-secondary btn-sm px-3 rounded-pill">Sign In</a>
                <a href="${pageContext.request.contextPath}/register" class="btn btn-primary btn-sm px-3 rounded-pill">Register</a>
            </div>
        </div>
    </div>
</nav>

<div class="container mt-3">
    <jsp:include page="alerts.jsp" />
</div>
<main class="flex-grow-1">

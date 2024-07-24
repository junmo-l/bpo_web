document.addEventListener('DOMContentLoaded', function() {
    // 1. All WH Trend
    const allWHTrend = document.querySelector('.placeholder .All_WH_Trend');
    if (allWHTrend) {
        allWHTrend.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/ALL WH Trend = Selected.png";
        });
        allWHTrend.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/ALL WH Trend = Default.png";
        });
    }

    // 2. ARAP
    const arap = document.querySelector('.placeholder .ARAP');
    if (arap) {
        arap.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/ARAP = Selected.png";
        });
        arap.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/ARAP = Default.png";
        });
    }

    // 3. Cuchen
    const cuchen = document.querySelector('.placeholder .Cuchen');
    if (cuchen) {
        cuchen.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Cuchen = Selected.png";
        });
        cuchen.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Cuchen = Default.png";
        });
    }

    // 4. GPCA Logistics Trend
    const gpcaLT = document.querySelector('.placeholder .GPCA_LT');
    if (gpcaLT) {
        gpcaLT.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/GPCA LT = Selected.png";
        });
        gpcaLT.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/GPCA LT = Default.png";
        });
    }

    // 5. GPCA Logistics Trend IT BO
    const gpcaLTITBO = document.querySelector('.placeholder .GPCA_LT_IT_BO');
    if (gpcaLTITBO) {
        gpcaLTITBO.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/GPCA LT IT BO = Selected.png";
        });
        gpcaLTITBO.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/GPCA LT IT BO = Default.png";
        });
    }

    // 6. Pending Tickets
    const pendingTickets = document.querySelector('.placeholder .Pending_Tickets');
    if (pendingTickets) {
        pendingTickets.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Pending Tickets = Selected.png";
        });
        pendingTickets.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Pending Tickets = Default.png";
        });
    }

    // 7. STO
    const sto = document.querySelector('.placeholder .STO');
    if (sto) {
        sto.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/STO = Selected.png";
        });
        sto.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/STO = Default.png";
        });
    }

    // 8. Recall
    const recall = document.querySelector('.placeholder .Recall');
    if (recall) {
        recall.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Recall = Selected.png";
        });
        recall.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Recall = Default.png";
        });
    }

    // 1. Workspace
    const workspace = document.querySelector('.placeholder .Workspace');
    if (workspace) {
        workspace.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Workspace = Selected.png";
        });
        workspace.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Workspace = Default.png";
        });
    }

    // 2. Logout
    const logout = document.querySelector('.placeholder .Logout');
    if (logout) {
        logout.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Logout = Selected.png";
        });
        logout.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Logout = Default.png";
        });
    }

    // 1. management
    const management = document.querySelector('.placeholder .nav-management');
    if (management) {
        management.addEventListener('mouseover', function() {
            this.src = "static/images/dashboard_nav/Management = Selected.png";
        });
        management.addEventListener('mouseout', function() {
            this.src = "static/images/dashboard_nav/Management = Default.png";
        });
    }
});

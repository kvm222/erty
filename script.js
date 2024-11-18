const organizationTypes = {
    corporate: {
        leaveTypes: [
            { name: 'Annual Leave', total: 20 },
            { name: 'Sick Leave', total: 12 },
            { name: 'Personal Leave', total: 5 },
            { name: 'Work from Home', total: 10 }
        ],
        policy: `
            - Annual Leave: For personal vacations.
            - Sick Leave: For health-related issues.
            - Personal Leave: For personal emergencies.
            - Work from Home: Remote work with approval.
        `
    },
    education: {
        leaveTypes: [
            { name: 'Vacation Leave', total: 30 },
            { name: 'Sick Leave', total: 15 },
            { name: 'Professional Development', total: 10 },
            { name: 'Research Leave', total: 20 }
        ],
        policy: `
            - Vacation Leave: For holiday breaks.
            - Sick Leave: For illness or medical appointments.
            - Professional Development: For training or certifications.
            - Research Leave: For academic research.
        `
    },
    healthcare: {
        leaveTypes: [
            { name: 'Annual Leave', total: 25 },
            { name: 'Sick Leave', total: 15 },
            { name: 'Night Shift Compensation', total: 12 },
            { name: 'Emergency Leave', total: 10 }
        ],
        policy: `
            - Annual Leave: Standard leave allocation.
            - Sick Leave: For medical reasons.
            - Night Shift Compensation: Additional leave for night workers.
            - Emergency Leave: For urgent personal situations.
        `
    }
};

let currentOrg = 'corporate';
let currentLeaveRequests = [];
let currentLeaveBalance = {};
let currentUserRole = 'employee';

function updateOrganizationType() {
    currentOrg = document.getElementById('orgType').value;
    const orgData = organizationTypes[currentOrg];
    const leaveTypeSelect = document.getElementById('leaveType');

    leaveTypeSelect.innerHTML = '';
    orgData.leaveTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        leaveTypeSelect.appendChild(option);
    });

    currentLeaveBalance = {};
    orgData.leaveTypes.forEach(type => {
        currentLeaveBalance[type.name] = { total: type.total, used: 0 };
    });

    document.getElementById('leavePolicy').textContent = orgData.policy;
    updateLeaveBalance();
    clearLeaveRequests();
}

function updateLeaveBalance() {
    const balanceContainer = document.getElementById('leaveBalance');
    balanceContainer.innerHTML = '';
    Object.entries(currentLeaveBalance).forEach(([type, balance]) => {
        const card = document.createElement('div');
        card.className = 'balance-card';
        card.innerHTML = `<h3>${balance.total - balance.used}</h3><p>${type}</p>`;
        balanceContainer.appendChild(card);
    });
}

function submitLeaveRequest(e) {
    e.preventDefault();
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value;
    const manager = document.getElementById('manager').value;

    const leaveDays = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (currentLeaveBalance[leaveType].used + leaveDays > currentLeaveBalance[leaveType].total) {
        alert('Not enough leave balance for this request.');
        return;
    }

    const leaveRequest = {
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'Pending',
        manager
    };

    currentLeaveRequests.push(leaveRequest);
    currentLeaveBalance[leaveType].used += leaveDays;

    updateLeaveRequestsTable();
    updateLeaveBalance();
}

function updateLeaveRequestsTable() {
    const tableBody = document.getElementById('leaveRequestsTable');
    tableBody.innerHTML = '';
    currentLeaveRequests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.leaveType}</td>
            <td>${request.startDate} to ${request.endDate}</td>
            <td><span class="status ${request.status.toLowerCase()}">${request.status}</span></td>
            <td>
                ${currentUserRole === 'manager' ? `
                <button onclick="updateLeaveStatus(${index}, 'Approved')">Approve</button> 
                <button onclick="updateLeaveStatus(${index}, 'Rejected')">Reject</button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateLeaveStatus(index, status) {
    currentLeaveRequests[index].status = status;
    updateLeaveRequestsTable();
    updateCalendar();
}

function clearLeaveRequests() {
    currentLeaveRequests = [];
    document.getElementById('leaveRequestsTable').innerHTML = '';
    updateCalendar();
}

function setUserRole(role) {
    currentUserRole = role;
    alert(`User role switched to ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    updateLeaveRequestsTable();
}

function updateCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: currentLeaveRequests.map(request => ({
            title: request.leaveType,
            start: request.startDate,
            end: new Date(new Date(request.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            color: request.status === 'Approved' ? '#28a745' : request.status === 'Rejected' ? '#dc3545' : '#ffc107'
        }))
    });
    calendar.render();
}

document.getElementById('leaveForm').addEventListener('submit', submitLeaveRequest);
document.addEventListener('DOMContentLoaded', function () {
    updateOrganizationType();
    updateCalendar();
});

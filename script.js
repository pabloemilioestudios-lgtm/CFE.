:root {
    --blue-dark: #071b3a;
    --blue: #0b2d5c;
    --blue-light: #174d8f;
    --gold: #d4af37;
    --gold-light: #f0d878;
    --white: #ffffff;
    --gray: #eef2f7;
    --text: #172033;
    --muted: #6d7789;
    --green: #16845b;
    --red: #b93838;
    --orange: #c47b16;
    --shadow: 0 12px 35px rgba(7, 27, 58, 0.12);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f3f6fa;
    color: var(--text);
}

button,
input {
    font: inherit;
}

button {
    cursor: pointer;
}

.hidden {
    display: none !important;
}


/* LOGIN */

.login-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px;

    background:
        radial-gradient(circle at top right, rgba(212,175,55,.2), transparent 35%),
        linear-gradient(135deg, #061832, #0d376d);
}

.login-card {
    width: min(440px, 100%);
    background: rgba(255,255,255,.98);
    border-radius: 22px;
    padding: 38px;
    box-shadow: 0 25px 70px rgba(0,0,0,.28);
    border-top: 5px solid var(--gold);
}

.brand {
    text-align: center;
    margin-bottom: 32px;
}

.brand-symbol {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: var(--blue);
    color: var(--gold);

    font-weight: 800;
    font-size: 20px;

    border: 3px solid var(--gold);
}

.brand h1 {
    color: var(--blue-dark);
    font-size: 27px;
    margin-bottom: 7px;
}

.brand p {
    color: var(--muted);
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 700;
    font-size: 14px;
}

input {
    width: 100%;
    padding: 14px 15px;
    border: 1px solid #d5dce7;
    border-radius: 10px;
    outline: none;
    margin-bottom: 18px;
    background: #fafbfd;
}

input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(212,175,55,.14);
}

.primary-btn,
.secondary-btn,
.success-btn,
.warning-btn,
.danger-btn,
.logout-btn {
    border: none;
    border-radius: 10px;
    padding: 12px 17px;
    font-weight: 700;
    transition: .2s;
}

.primary-btn {
    background: var(--blue);
    color: white;
}

.primary-btn:hover {
    background: var(--blue-light);
    transform: translateY(-1px);
}

.primary-btn.disabled,
.primary-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
    transform: none;
}

.secondary-btn {
    background: #e8edf4;
    color: var(--blue-dark);
}

.success-btn {
    background: var(--green);
    color: white;
}

.warning-btn {
    background: var(--orange);
    color: white;
}

.danger-btn {
    background: var(--red);
    color: white;
}

.logout-btn {
    background: rgba(255,255,255,.1);
    color: white;
    border: 1px solid rgba(255,255,255,.25);
}

.management-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.error-message {
    color: var(--red);
    text-align: center;
    margin-top: 12px;
    min-height: 18px;
    font-size: 14px;
}

.login-info {
    margin-top: 25px;
    padding-top: 18px;
    border-top: 1px solid #e5e8ee;

    display: flex;
    justify-content: center;
    gap: 8px;

    color: var(--muted);
    font-size: 13px;
}


/* TOPBAR */

.topbar {
    min-height: 78px;
    padding: 15px 5%;
    background: var(--blue-dark);
    color: white;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-bottom: 3px solid var(--gold);
}

.small-title,
.section-label {
    color: var(--gold);
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 1.5px;
}

.topbar h2 {
    margin-top: 4px;
    font-size: 21px;
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-badge,
.admin-badge,
.count-badge {
    border-radius: 30px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 800;
}

.user-badge {
    background: rgba(255,255,255,.12);
}

.admin-badge {
    color: var(--gold-light);
    border: 1px solid rgba(212,175,55,.5);
}


/* CONTENT */

.main-content {
    width: min(1180px, 92%);
    margin: 35px auto 70px;
}

.panel {
    background: white;
    border-radius: 17px;
    padding: 26px;
    margin-bottom: 25px;
    box-shadow: var(--shadow);
    border: 1px solid #e5eaf1;
}

.panel-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
}

.panel-title h2 {
    margin-top: 5px;
}

.muted {
    color: var(--muted);
    line-height: 1.6;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 800;
}

.status-badge.active {
    color: var(--green);
    background: #e4f6ed;
}

.status-badge.inactive {
    color: var(--muted);
    background: #edf0f4;
}

.status-badge.finished {
    color: var(--red);
    background: #fae8e8;
}


/* VOTER */

.election-header {
    text-align: center;
    margin-bottom: 30px;
}

.election-header h1 {
    color: var(--blue-dark);
    margin: 15px 0 8px;
    font-size: 30px;
}

.election-header p {
    color: var(--muted);
}

.party-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 17px;
}

.party-card {
    background: white;
    border: 2px solid #e2e7ef;
    border-radius: 17px;
    padding: 22px 15px;
    text-align: center;
    transition: .2s;
    box-shadow: 0 7px 20px rgba(7,27,58,.06);
}

.party-card:hover {
    transform: translateY(-4px);
    border-color: var(--gold);
}

.party-card.selected {
    border-color: var(--gold);
    background: #fffdf5;
    box-shadow: 0 8px 28px rgba(212,175,55,.2);
}

.party-symbol {
    width: 62px;
    height: 62px;
    margin: 0 auto 15px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: var(--blue);
    color: var(--gold);

    border: 2px solid var(--gold);

    font-weight: 900;
    font-size: 20px;
}

.party-card h3 {
    font-size: 17px;
    margin-bottom: 10px;
}

.party-card p {
    color: var(--muted);
    min-height: 40px;
    font-size: 13px;
}

.select-party {
    width: 100%;
    margin-top: 17px;
    padding: 10px;
    border-radius: 9px;
    border: none;
    background: var(--blue);
    color: white;
    font-weight: 700;
}

.party-card.selected .select-party {
    background: var(--gold);
    color: var(--blue-dark);
}

.vote-footer {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.vote-footer button {
    min-width: 240px;
}

.panel.empty-state {
    text-align: center;
}

.empty-icon,
.success-icon {
    font-size: 45px;
    margin-bottom: 15px;
}

.success-icon {
    width: 70px;
    height: 70px;
    margin-left: auto;
    margin-right: auto;

    border-radius: 50%;
    background: #e4f6ed;
    color: var(--green);

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 900;
}

#alreadyVoted {
    text-align: center;
}

#alreadyVoted p {
    margin: 10px 0 20px;
    color: var(--muted);
}


/* MANAGEMENT */

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.candidate-management {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 20px 0;
}

.candidate-row {
    border: 1px solid #e0e5ed;
    border-radius: 12px;
    padding: 15px;
}

.candidate-row strong {
    display: block;
    margin-bottom: 9px;
    color: var(--blue-dark);
}

.candidate-row input {
    margin-bottom: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 25px;
}

.stat-card {
    background: white;
    border-radius: 16px;
    padding: 22px;
    box-shadow: var(--shadow);
    border: 1px solid #e5eaf1;
}

.stat-icon {
    display: block;
    font-size: 22px;
    margin-bottom: 14px;
}

.stat-label {
    display: block;
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--muted);
    font-weight: 800;
    margin-bottom: 5px;
}

.stat-card strong {
    font-size: 28px;
    color: var(--blue-dark);
}

.results-chart {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.chart-row {
    display: grid;
    grid-template-columns: 210px 1fr 50px;
    align-items: center;
    gap: 12px;
}

.chart-name {
    font-weight: 700;
    font-size: 13px;
}

.chart-bar-bg {
    height: 13px;
    border-radius: 20px;
    background: #e9edf3;
    overflow: hidden;
}

.chart-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--blue), var(--gold));
    border-radius: 20px;
    transition: width .5s ease;
}

.chart-number {
    text-align: right;
    font-weight: 800;
}

.voter-status-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.voter-status {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 14px;
    border-radius: 10px;
    background: #f5f7fa;
}

.voter-status .voter-name {
    font-weight: 800;
}

.voted {
    color: var(--green);
    font-weight: 800;
    font-size: 12px;
}

.pending {
    color: var(--orange);
    font-weight: 800;
    font-size: 12px;
}

.count-badge {
    color: var(--blue-dark);
    background: #f0d878;
}


/* RECEIPTS */

.receipt-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.receipt-item {
    display: grid;
    grid-template-columns: 120px 1fr 1fr 150px;
    gap: 15px;
    align-items: center;

    padding: 15px;
    background: #f7f9fc;
    border-radius: 11px;
    border: 1px solid #e5eaf1;
}

.receipt-id {
    font-weight: 900;
    color: var(--blue);
}

.receipt-item strong {
    display: block;
}

.receipt-item span {
    font-size: 11px;
    color: var(--muted);
}

.receipt-view {
    justify-self: end;
}


/* MODALS */

.modal {
    position: fixed;
    inset: 0;

    background: rgba(3, 13, 30, .72);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    z-index: 1000;
}

.receipt-card,
.confirm-card {
    width: min(520px, 100%);
    background: white;
    border-radius: 18px;
    position: relative;
    box-shadow: 0 25px 70px rgba(0,0,0,.35);
}

.receipt-card {
    padding: 30px;
    border-top: 6px solid var(--gold);
}

.close-modal {
    position: absolute;
    right: 15px;
    top: 12px;

    border: none;
    background: transparent;

    font-size: 30px;
    color: var(--muted);
}

.receipt-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-right: 25px;
}

.receipt-logo {
    width: 52px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: var(--blue);
    color: var(--gold);

    border: 2px solid var(--gold);
    border-radius: 50%;

    font-weight: 900;
}

.receipt-header span {
    font-size: 10px;
    color: var(--gold);
    font-weight: 900;
    letter-spacing: 1px;
}

.receipt-header h2 {
    margin-top: 5px;
    font-size: 20px;
    color: var(--blue-dark);
}

.receipt-divider {
    height: 1px;
    background: #dfe4eb;
    margin: 25px 0;
}

.receipt-number {
    text-align: center;
    margin-bottom: 25px;
}

.receipt-number span {
    display: block;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 1px;
}

.receipt-number strong {
    display: block;
    color: var(--blue-dark);
    font-size: 31px;
    margin-top: 5px;
}

.receipt-data {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

.receipt-data span {
    display: block;
    color: var(--muted);
    font-size: 10px;
    font-weight: 800;
    margin-bottom: 5px;
}

.receipt-data strong {
    color: var(--blue-dark);
}

.receipt-confirmed {
    text-align: center;
    margin-top: 28px;
    padding: 12px;
    background: #e4f6ed;
    color: var(--green);
    border-radius: 9px;
    font-weight: 900;
}

.receipt-note {
    text-align: center;
    color: var(--muted);
    font-size: 11px;
    margin-top: 15px;
}

.confirm-card {
    padding: 32px;
    text-align: center;
}

.confirm-icon {
    font-size: 45px;
    margin-bottom: 15px;
}

.confirm-card h2 {
    color: var(--blue-dark);
    margin-bottom: 10px;
}

.confirm-card p {
    color: var(--muted);
    line-height: 1.5;
}

#selectedPartyName {
    display: block;
    color: var(--blue);
    font-size: 22px;
    margin: 12px 0;
}

.warning-text {
    font-size: 13px;
    color: var(--orange) !important;
}

.confirm-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 25px;
}


/* RESPONSIVE */

@media (max-width: 950px) {

    .party-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .voter-status-list {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 700px) {

    .topbar {
        padding: 14px 20px;
    }

    .topbar-right {
        gap: 7px;
    }

    .admin-badge {
        display: none;
    }

    .main-content {
        width: 94%;
        margin-top: 20px;
    }

    .panel {
        padding: 19px;
    }

    .party-grid {
        grid-template-columns: 1fr 1fr;
    }

    .form-grid,
    .candidate-management,
    .voter-status-list {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }

    .chart-row {
        grid-template-columns: 120px 1fr 35px;
    }

    .receipt-item {
        grid-template-columns: 1fr 1fr;
    }

    .receipt-view {
        justify-self: start;
    }
}

@media (max-width: 450px) {

    .login-card {
        padding: 25px 20px;
    }

    .party-grid {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .topbar h2 {
        font-size: 17px;
    }

    .user-badge {
        display: none;
    }

    .receipt-data {
        grid-template-columns: 1fr;
    }

    .confirm-buttons {
        flex-direction: column;
    }

    .confirm-buttons button {
        width: 100%;
    }
}

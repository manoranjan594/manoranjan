// Manoranjan - Money Saving & Expense Tracker
// Daily, Monthly, Yearly savings connected with UPI payments

const STORAGE_KEY = 'manoranjan_transactions';
const GOALS_KEY = 'manoranjan_savings_goals';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDate();
  loadTransactions();
  setupEventListeners();
});

function setDefaultDate() {
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  loadTransactions();
}

// Calculations
function getSavings(transactions, period) {
  const now = new Date();
  let filtered = [...transactions];

  if (period === 'daily') {
    const today = now.toISOString().split('T')[0];
    filtered = filtered.filter(t => t.date === today);
  } else if (period === 'monthly') {
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filtered = filtered.filter(t => t.date.startsWith(yearMonth));
  } else if (period === 'yearly') {
    const year = now.getFullYear().toString();
    filtered = filtered.filter(t => t.date.startsWith(year));
  }

  let income = 0, expense = 0, saving = 0;
  filtered.forEach(t => {
    const amount = parseFloat(t.amount) || 0;
    if (t.type === 'income') income += amount;
    else if (t.type === 'expense') expense += amount;
    else if (t.type === 'saving') saving += amount;
  });

  // Savings = Income - Expenses + Direct Savings
  return (income - expense) + saving;
}

function getGoals() {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveGoal(period, amount) {
  const goals = getGoals();
  goals[period] = amount ? parseFloat(amount) : null;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  updateSummary();
}

function updateSummary() {
  const transactions = getTransactions();
  const goals = getGoals();
  const daily = getSavings(transactions, 'daily');
  const monthly = getSavings(transactions, 'monthly');
  const yearly = getSavings(transactions, 'yearly');

  const formatAmount = (val) => {
    const num = parseFloat(val);
    const prefix = num >= 0 ? '' : '-';
    return `₹${prefix}${Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const updateCard = (elId, value, goalLineId, period) => {
    const el = document.getElementById(elId);
    const goalLine = document.getElementById(goalLineId);
    if (el) {
      el.textContent = formatAmount(value);
      el.className = 'card-value ' + (value >= 0 ? 'positive' : 'negative');
    }
    if (goalLine) {
      const goal = goals[period];
      if (goal && goal > 0) {
        const pct = Math.min(100, Math.round((value / goal) * 100));
        goalLine.textContent = `Goal: ${formatAmount(goal)} (${pct}%)`;
        goalLine.style.display = 'block';
      } else {
        goalLine.textContent = '';
        goalLine.style.display = 'none';
      }
    }
  };

  updateCard('dailySavings', daily, 'dailyGoalLine', 'daily');
  updateCard('monthlySavings', monthly, 'monthlyGoalLine', 'monthly');
  updateCard('yearlySavings', yearly, 'yearlyGoalLine', 'yearly');
}

// Render Transactions
function renderTransactions(filter = 'all') {
  const list = document.getElementById('transactionsList');
  const emptyState = document.getElementById('emptyState');
  const transactions = getTransactions();

  let filtered = [...transactions];
  const now = new Date();

  if (filter === 'today') {
    const today = now.toISOString().split('T')[0];
    filtered = filtered.filter(t => t.date === today);
  } else if (filter === 'month') {
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filtered = filtered.filter(t => t.date.startsWith(yearMonth));
  } else if (filter === 'year') {
    const year = now.getFullYear().toString();
    filtered = filtered.filter(t => t.date.startsWith(year));
  }

  filtered.sort((a, b) => new Date(b.date + ' ' + (b.time || '')) - new Date(a.date + ' ' + (a.time || '')));

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state" id="emptyState">
        <div class="empty-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="4" y="10" width="40" height="28" rx="3"/>
            <line x1="4" y1="18" x2="44" y2="18"/>
            <line x1="12" y1="26" x2="20" y2="26"/>
          </svg>
        </div>
        <p>No transactions found</p>
        <span>${filter === 'all' ? 'Add your first expense, income, or savings to get started' : 'Try a different filter'}</span>
      </div>
    `;
  } else {
    list.innerHTML = filtered.map(t => createTransactionHTML(t)).join('');
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTransaction(btn.dataset.id);
      });
    });
  }

  updateSummary();
}

const ICONS = {
  expense: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  income: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  saving: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
};

const DELETE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

function createTransactionHTML(t) {
  const typeLabels = { expense: 'Expense', income: 'Income', saving: 'Saving' };
  const amount = parseFloat(t.amount) || 0;
  const isNegative = t.type === 'expense';
  const formattedAmount = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const paymentBadge = t.paymentMethod === 'upi' 
    ? '<span class="payment-badge">UPI</span>' 
    : '';

  return `
    <div class="transaction-item" data-id="${t.id}">
      <div class="transaction-left">
        <div class="transaction-icon ${t.type}">${ICONS[t.type]}</div>
        <div class="transaction-details">
          <h4>${escapeHtml(t.description || typeLabels[t.type])}</h4>
          <div class="transaction-meta">
            ${t.date} ${paymentBadge}
          </div>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${t.type}">${isNegative ? '-' : '+'}${formattedAmount}</span>
        <button class="delete-btn" data-id="${t.id}" title="Delete">${DELETE_ICON}</button>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function deleteTransaction(id) {
  const transactions = getTransactions().filter(t => t.id !== id);
  saveTransactions(transactions);
}

// Event Listeners
function setupEventListeners() {
  const form = document.getElementById('transactionForm');
  if (form) {
    form.addEventListener('submit', handleAddTransaction);
  }

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTransactions(tab.dataset.filter);
    });
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (typeof logout === 'function') logout();
  });
  document.getElementById('exportBtn')?.addEventListener('click', exportToFile);
  document.getElementById('syncDriveBtn')?.addEventListener('click', saveToDrive);
  document.getElementById('importBtn')?.addEventListener('click', () => 
    document.getElementById('importFile').click());
  document.getElementById('importFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromFile(file);
      e.target.value = '';
    }
  });

  document.querySelectorAll('.card-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openGoalModal(btn.dataset.period));
  });
  document.getElementById('goalCancelBtn')?.addEventListener('click', closeGoalModal);
  document.getElementById('goalForm')?.addEventListener('submit', handleGoalSubmit);
  document.getElementById('goalModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeGoalModal();
  });
}

function openGoalModal(period) {
  const labels = { daily: "Today's", monthly: 'Monthly', yearly: 'Yearly' };
  document.getElementById('goalModalTitle').textContent = `Set ${labels[period]} savings goal`;
  document.getElementById('goalPeriod').value = period;
  document.getElementById('goalAmount').value = getGoals()[period] || '';
  document.getElementById('goalModal').classList.add('active');
  document.getElementById('goalAmount').focus();
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.remove('active');
}

function handleGoalSubmit(e) {
  e.preventDefault();
  const period = document.getElementById('goalPeriod').value;
  const amount = document.getElementById('goalAmount').value;
  saveGoal(period, amount || null);
  closeGoalModal();
}

function handleAddTransaction(e) {
  e.preventDefault();
  const form = e.target;
  const type = form.querySelector('#type').value;
  const amount = parseFloat(form.querySelector('#amount').value) || 0;
  const description = form.querySelector('#description').value.trim();
  const paymentMethod = form.querySelector('#paymentMethod').value;
  const date = form.querySelector('#date').value;

  const transaction = {
    id: Date.now().toString(),
    type,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    description: description || (type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Saving'),
    paymentMethod,
    date,
    time: new Date().toTimeString().split(' ')[0],
    createdAt: new Date().toISOString()
  };

  // Store as positive for calculations, use type for sign
  transaction.amount = Math.abs(amount);

  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);

  form.reset();
  setDefaultDate();
  document.querySelector('.filter-tab.active')?.click();
}

function loadTransactions() {
  const filter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
  renderTransactions(filter);
}

// Export
function exportToFile() {
  const data = {
    exportedAt: new Date().toISOString(),
    transactions: getTransactions()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manoranjan-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import (for restoring from backup)
function importFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const transactions = data.transactions || [];
      if (Array.isArray(transactions) && transactions.length > 0) {
        saveTransactions(transactions);
        alert('Backup restored successfully!');
      }
    } catch (err) {
      alert('Invalid backup file.');
    }
  };
  reader.readAsText(file);
}

function saveToDrive() {
  const data = {
    exportedAt: new Date().toISOString(),
    transactions: getTransactions()
  };
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manoranjan-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  window.open('https://drive.google.com/drive/u/0/my-drive', '_blank', 'noopener');
  alert('Backup downloaded! Google Drive opened — drag the file into Drive to save.');
}

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { apiRequest } from '../services/api'
import './CustomersPage.css'

const CUSTOMER_FIELDS = {
  fullName: '',
  email: '',
  username: '',
  phone: '',
  bio: '',
  interests: '',
  preferredCategory: 'General inspiration',
  marketingOptIn: false,
}

function requestCustomers(path, user, options) {
  return apiRequest(`/demo/customers${path}`, user, options)
}

function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(CUSTOMER_FIELDS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState('')

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await requestCustomers('?limit=10', user)
      setCustomers(payload.customers)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let ignoreResult = false
    requestCustomers('?limit=10', user)
      .then((payload) => {
        if (!ignoreResult) setCustomers(payload.customers)
      })
      .catch((loadError) => {
        if (!ignoreResult) setError(loadError.message)
      })
      .finally(() => {
        if (!ignoreResult) setLoading(false)
      })

    return () => {
      ignoreResult = true
    }
  }, [user])

  function handleChange(event) {
    const { name, value, checked, type } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleCancelEdit() {
    setEditingCustomer(null)
    setForm(CUSTOMER_FIELDS)
    setError('')
    setNotice('')
  }

  function handleEdit(customer) {
    setEditingCustomer(customer)
    setForm({
      ...CUSTOMER_FIELDS,
      ...customer,
      interests: (customer.interests || []).join(', '),
    })
    setError('')
    setNotice('')
    document.getElementById('customer-form-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Permanently delete ${customer.fullName} from the customers collection?`)) return

    setDeletingCustomerId(customer.id)
    setError('')
    setNotice('')
    try {
      await requestCustomers(`/${encodeURIComponent(customer.id)}`, user, { method: 'DELETE' })
      if (editingCustomer?.id === customer.id) handleCancelEdit()
      setNotice(`${customer.fullName} was deleted.`)
      await loadCustomers()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingCustomerId('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await requestCustomers(editingCustomer ? `/${encodeURIComponent(editingCustomer.id)}` : '', user, {
        method: editingCustomer ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...form,
          interests: form.interests.split(',').map((interest) => interest.trim()).filter(Boolean),
        }),
      })
      setForm(CUSTOMER_FIELDS)
      setNotice(editingCustomer ? 'Customer details updated.' : 'Customer saved to the MongoDB customers collection.')
      setEditingCustomer(null)
      await loadCustomers()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="customers-page container">
      <header className="customers-heading">
        <p className="page-eyebrow"><span /> Project 2 · MongoDB</p>
        <h1>Customer <em>directory.</em></h1>
        <p>Register a Pinboard Studio customer and review the first 10 records stored in the live database.</p>
      </header>

      <div className="customers-grid">
        <section className="customer-card" aria-labelledby="customer-form-title">
          <div className="customer-card-heading">
            <div><p className="customer-kicker">CUSTOMER COLLECTION</p><h2 id="customer-form-title">{editingCustomer ? 'Edit customer' : 'Add a customer'}</h2></div>
            <span className="customer-badge">{editingCustomer ? `ID: ${editingCustomer.id}` : 'New record'}</span>
          </div>
          <form className="customer-form" onSubmit={handleSubmit}>
            <div className="customer-form-row">
              <label>Full name<input name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} maxLength="100" required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} maxLength="254" required /></label>
            </div>
            <div className="customer-form-row">
              <label>Username<input name="username" autoComplete="username" value={form.username} onChange={handleChange} maxLength="30" required /></label>
              <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} maxLength="30" /></label>
            </div>
            <label>About you<textarea name="bio" value={form.bio} onChange={handleChange} rows="3" maxLength="500" placeholder="A short profile introduction" /></label>
            <div className="customer-form-row">
              <label>Interests <span>(comma-separated)</span><input name="interests" value={form.interests} onChange={handleChange} maxLength="300" placeholder="illustration, interiors, travel" /></label>
              <label>Favorite inspiration category<select name="preferredCategory" value={form.preferredCategory} onChange={handleChange}>
                <option>General inspiration</option><option>Art & illustration</option><option>Home & interiors</option><option>Fashion & style</option><option>Food & recipes</option><option>Travel</option><option>DIY & crafts</option>
              </select></label>
            </div>
            <label className="customer-consent"><input type="checkbox" name="marketingOptIn" checked={form.marketingOptIn} onChange={handleChange} /> I agree to receive occasional product updates.</label>
            <button className="customer-submit" type="submit" disabled={saving}>{saving ? 'Saving customer…' : editingCustomer ? 'Update customer' : 'Save customer'} <span aria-hidden="true">↗</span></button>
            {editingCustomer && <button className="customer-cancel" type="button" onClick={handleCancelEdit} disabled={saving}>Cancel edit</button>}
          </form>
          {notice && <p className="customer-message success" role="status">{notice}</p>}
          {error && <p className="customer-message failure" role="alert">{error}</p>}
        </section>

        <section className="customer-card directory-card" aria-labelledby="directory-title">
          <div className="customer-card-heading">
            <div><p className="customer-kicker">DATABASE PREVIEW</p><h2 id="directory-title">First 10 customers</h2></div>
            <button className="customer-refresh" type="button" onClick={loadCustomers} disabled={loading} aria-label="Refresh customer list">↻</button>
          </div>
          <p className="directory-caption">Live results from the MongoDB <strong>customers</strong> collection.</p>
          {loading ? <p className="directory-empty" role="status">Loading customer records…</p> : customers.length === 0 ? (
            <p className="directory-empty">No customers yet. Submit the form to create the first record.</p>
          ) : (
            <div className="customer-table-wrap">
              <table className="customer-table">
                <thead><tr><th>Name</th><th>Email</th><th>Username</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>{customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.fullName}</td><td>{customer.email}</td><td>@{customer.username}</td><td>{customer.preferredCategory}</td>
                    <td className="customer-row-actions">
                      <button className="customer-action edit" type="button" onClick={() => handleEdit(customer)} aria-label={`Edit ${customer.fullName}`}>Edit</button>
                      <button className="customer-action delete" type="button" onClick={() => handleDelete(customer)} disabled={deletingCustomerId === customer.id} aria-label={`Delete ${customer.fullName}`}>{deletingCustomerId === customer.id ? 'Deleting…' : 'Delete'}</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <p className="directory-count">Showing {customers.length} of up to 10 records</p>
        </section>
      </div>
    </main>
  )
}

export default CustomersPage

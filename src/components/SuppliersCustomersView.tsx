import React, { useState } from 'react';
import {
  Users,
  Truck,
  Plus,
  Search,
  Star,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';
import { Supplier, Customer } from '../types';

interface SuppliersCustomersViewProps {
  suppliers: Supplier[];
  customers: Customer[];
  onAddSupplier: (sup: Omit<Supplier, 'id'>) => void;
  onAddCustomer: (cust: Omit<Customer, 'id'>) => void;
}

export const SuppliersCustomersView: React.FC<SuppliersCustomersViewProps> = ({
  suppliers,
  customers,
  onAddSupplier,
  onAddCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers'>('suppliers');
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState<'tea_estate' | 'packaging_converter' | 'both'>('tea_estate');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCountry, setSupCountry] = useState('Kenya');
  const [supCert, setSupCert] = useState('Rainforest Alliance & ISO 22000');

  // Customer Form
  const [custName, setCustName] = useState('');
  const [custType, setCustType] = useState<any>('retail_chain');
  const [custContact, setCustContact] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  const handleSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    onAddSupplier({
      name: supName,
      category: supCategory,
      contactPerson: supContact,
      email: supEmail,
      phone: supPhone,
      country: supCountry,
      certification: supCert,
      rating: 5,
    });
    setIsSupModalOpen(false);
    setSupName('');
  };

  const handleCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;
    onAddCustomer({
      companyName: custName,
      contactName: custContact,
      email: custEmail,
      phone: custPhone,
      address: custAddress,
      customerType: custType,
    });
    setIsCustModalOpen(false);
    setCustName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Supply Chain Partners &amp; Customer Network</span>
          </h2>
          <p className="text-xs text-stone-500">
            Certified tea plantations, packaging film converters, and wholesale distribution clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-stone-300 bg-stone-50 p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'suppliers' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeTab === 'customers' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Customers ({customers.length})
            </button>
          </div>

          {activeTab === 'suppliers' ? (
            <button
              onClick={() => setIsSupModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3 py-1.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCustModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3 py-1.5 rounded shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Suppliers Grid */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-stone-900">{sup.name}</h3>
                    <span className="px-2 py-0.2 rounded font-mono text-[10px] bg-stone-100 text-stone-700 font-semibold">
                      {sup.category === 'tea_estate'
                        ? 'Tea Plantation'
                        : sup.category === 'packaging_converter'
                        ? 'Packaging Converter'
                        : 'Bulk & Packaging'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{sup.country}</div>
                </div>

                {sup.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="font-bold">{sup.rating}</span>
                  </div>
                )}
              </div>

              {sup.certification && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{sup.certification}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customers Grid */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((cust) => (
            <div key={cust.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-stone-900">{cust.companyName}</h3>
                    <span className="px-2 py-0.2 rounded font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                      {cust.customerType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{cust.address}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{cust.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {isSupModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Add Supply Chain Partner</h3>
              <button onClick={() => setIsSupModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleSupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Company / Estate Name</label>
                <input
                  type="text" required value={supName} onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Partner Category</label>
                <select
                  value={supCategory} onChange={(e) => setSupCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5"
                >
                  <option value="tea_estate">Tea Plantation / Estate</option>
                  <option value="packaging_converter">Packaging Material Converter / Film Supplier</option>
                  <option value="both">Integrated Producer &amp; Packer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Country / Region</label>
                  <input type="text" value={supCountry} onChange={(e) => setSupCountry(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Contact Person</label>
                  <input type="text" value={supContact} onChange={(e) => setSupContact(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Email Address</label>
                  <input type="email" value={supEmail} onChange={(e) => setSupEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Phone Number</label>
                  <input type="text" value={supPhone} onChange={(e) => setSupPhone(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Quality Certifications</label>
                <input type="text" value={supCert} onChange={(e) => setSupCert(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" placeholder="e.g. Rainforest Alliance, BRCGS Grade AA" />
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsSupModalOpen(false)} className="px-4 py-1.5 rounded border border-stone-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isCustModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Add Wholesale Client / Customer</h3>
              <button onClick={() => setIsCustModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleCustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Client Company Name</label>
                <input type="text" required value={custName} onChange={(e) => setCustName(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Customer Channel</label>
                <select value={custType} onChange={(e) => setCustType(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5">
                  <option value="retail_chain">Supermarket / Retail Chain</option>
                  <option value="distributor">Wholesale Distributor</option>
                  <option value="exporter">International Tea Exporter</option>
                  <option value="tea_boutique">Artisan Tea Boutique / Cafe</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Contact Name</label>
                  <input type="text" value={custContact} onChange={(e) => setCustContact(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Phone</label>
                  <input type="text" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Email Address</label>
                <input type="email" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Delivery Address</label>
                <input type="text" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5" />
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCustModalOpen(false)} className="px-4 py-1.5 rounded border border-stone-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

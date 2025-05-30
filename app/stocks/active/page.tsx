'use client';

import { DrugModel } from '@/app/model/drug_model';
import { PharmacyModel } from '@/app/model/pharmacy_model';
import { getActiveStocks, } from '@/server/product';
import { deletePharmacy, getPharmacies } from '@/server/pharmacies'

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 9;

const ActiveStock = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyModel[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyModel | null>(null);
  const [drugs, setDrugs] = useState<DrugModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'pharmacies' | 'stocks'>('pharmacies');
  const router = useRouter();

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        const data = await getPharmacies();
        setPharmacies(data);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  useEffect(() => {
    if (selectedPharmacy) {
      const fetchDrugs = async () => {
        try {
          setLoading(true);
          const data = await getActiveStocks(selectedPharmacy.id);
          setDrugs(data);
        } catch (error) {
          console.error('Error fetching drugs:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDrugs();
    }
  }, [selectedPharmacy]);

  // Filter drugs based on search term
  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDrugs.length / ITEMS_PER_PAGE);
  const currentItems = filteredDrugs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDrugDetail = (id: string) => {
    router.push(`/stocks/${id}`);
  };

  const handlePharmacySelect = (pharmacy: PharmacyModel) => {
    setSelectedPharmacy(pharmacy);
    setView('stocks');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleBackToPharmacies = () => {
    setSelectedPharmacy(null);
    setView('pharmacies');
    setDrugs([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {view === 'pharmacies' ? (
        <>
          <h4 className='text-2xl font-bold text-center mb-5 uppercase'>Select Pharmacy</h4>
          <div className='grid md:grid-cols-3 grid-cols-1 gap-6'>
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer'
                onClick={() => handlePharmacySelect(pharmacy)}
              >
                <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                  {pharmacy.image ? (
                    <Image
                      src={pharmacy.image}
                      alt={pharmacy.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className='text-xl font-bold text-center'>{pharmacy.name}</h3>
                <p className='text-sm text-gray-600 text-center mt-1'>{pharmacy.address}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{pharmacy.phoneNumber}</span>
                  <span className="text-sm font-medium">Delivery: ₦{pharmacy.deliveryFee}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackToPharmacies}
              className="mr-4 text-blue-500 hover:text-blue-700"
            >
              ← Back to Pharmacies
            </button>
            <h4 className='text-2xl font-bold uppercase'>
              Active Stocks for {selectedPharmacy?.name}
            </h4>
          </div>

          <div className="flex md:justify-between gap-2 md:flex-row flex-col mb-6">
            <form className="md:w-1/2 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <IoSearchOutline />
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search drugs by name or description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </form>
            <div className='md:justify-start justify-end md:flex-col flex md:w-fit w-full'>
              <Link
                href={`/stocks/new-stock?pharmacyId=${selectedPharmacy?.id}`}
                className='btn bg-blue text-white rounded-2xl px-10 p-2 hover:bg-blue-600 transition'
              >
                Add Stock
              </Link>
            </div>
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg">No active stocks found for this pharmacy</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className='grid md:grid-cols-3 grid-cols-1 gap-4'>
                {currentItems.map((drug) => (
                  <div
                    key={drug.id}
                    className='bg-gray-100 rounded-2xl flex flex-col justify-between items-center p-4 hover:shadow-md transition cursor-pointer'
                    onClick={() => navigateToDrugDetail(drug.id)}
                  >
                    <div className='bg-white text-black px-3 py-1 rounded-2xl mb-2 w-full text-center'>
                      <span className='font-medium'>{drug.remaining} units available</span>
                    </div>
                    <div className="relative h-32 w-full mb-3">
                      {drug.images?.length > 0 ? (
                        <Image
                          src={drug.images[0]}
                          alt={drug.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className='text-lg font-bold text-center mt-2'>{drug.name}</h3>
                    <p className='text-sm text-gray-600 text-center line-clamp-2 mt-1'>
                      {drug.description || 'No description available'}
                    </p>
                    <button
                      className="mt-3 text-blue-500 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDrugDetail(drug.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className='mt-8 flex justify-center'>
                  <nav aria-label="Pagination">
                    <ul className="inline-flex -space-x-px">
                      <li>
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                          Previous
                        </button>
                      </li>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <li key={pageNum}>
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${currentPage === pageNum ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}

                      <li>
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ActiveStock;
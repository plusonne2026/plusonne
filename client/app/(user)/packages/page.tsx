"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PackagesAPI, Package } from "../../lib/api/packages.api";
import { CategoriesAPI, Category } from "../../lib/api/categories.api";
import { Loader2, ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import Image from "next/image";

export default function CategoryPackagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category");

  const [packages, setPackages] = useState<Package[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all packages and categories
        const [allPackages, allCategories] = await Promise.all([
          PackagesAPI.getAll(false),
          CategoriesAPI.getAll(false),
        ]);

        if (categoryId) {
          setPackages(allPackages.filter((pkg: Package) => pkg.categoryId === categoryId));
          setCategoryInfo(allCategories.find((c: Category) => c.categoryId === categoryId) || null);
        } else {
          setPackages(allPackages);
          setCategoryInfo(null);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#0098FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-outfit pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#07090E]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push("/home")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {categoryInfo ? categoryInfo.name : "All Packages"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {categoryInfo && (
          <div className="mb-12">
            <p className="text-slate-400 text-lg">{categoryInfo.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No packages found for this category.
            </div>
          ) : (
            packages.map((pkg) => (
              <div 
                key={pkg.packageId} 
                onClick={() => router.push(`/packages/${pkg.packageId}`)}
                className="bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.15] rounded-3xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl flex flex-col"
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <Image 
                    src={pkg.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"} 
                    alt={pkg.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white">
                    {categoryInfo?.name || pkg.categoryId}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-white">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#0098FF] transition-colors">{pkg.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {pkg.durationHours}H</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {pkg.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Starting from</p>
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        ₹{pkg.basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

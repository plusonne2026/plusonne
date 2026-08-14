"use client";

import React, { useEffect, useState } from "react";
import { PackagesAPI, Package } from "../../../lib/api/packages.api";
import { CategoriesAPI, Category } from "../../../lib/api/categories.api";
import {
  Database,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Package>>({
    packageId: "",
    categoryId: "",
    name: "",
    description: "",
    city: "",
    durationHours: 1,
    distanceKm: 10,
    basePrice: 1000,
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pkgs, cats] = await Promise.all([
        PackagesAPI.getAll(true),
        CategoriesAPI.getAll(true)
      ]);
      setPackages(pkgs);
      setCategories(cats);
    } catch (err: any) {
      setError(err.message || "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (packages.find(p => p.packageId === formData.packageId)) {
        await PackagesAPI.update(formData.packageId as string, formData);
      } else {
        // Defaults for required fields not in simple form
        const dataToSave = {
          ...formData,
          extraCharges: formData.extraCharges || { perExtraHour: 500, perExtraKm: 10 },
          cancellationPolicy: formData.cancellationPolicy || { freeCancelHoursBefore: 24, cancellationFee: 500 },
          inclusions: formData.inclusions || [],
          images: formData.images || [],
        };
        await PackagesAPI.create(dataToSave);
      }
      setIsModalOpen(false);
      toast.success("Package saved successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(`Error saving package: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      await PackagesAPI.delete(packageToDelete);
      toast.success("Package deleted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(`Error deleting package: ${err.message}`);
    } finally {
      setPackageToDelete(null);
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.packageId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full mx-auto space-y-6 font-outfit">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-black dark:text-white" />
            Packages
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Manage the pre-defined service packages available for booking.
          </p>
        </div>
        <Button onClick={() => {
          setFormData({ packageId: "", categoryId: "", name: "", description: "", city: "", durationHours: 1, distanceKm: 10, basePrice: 1000, isActive: true });
          setIsModalOpen(true);
        }} className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-white/5 bg-white dark:bg-[#09090b] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-[#0a0a0c] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search packages by name, ID, or city..."
                className="pl-9 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-black dark:text-white" />
              <p className="font-medium text-sm">Loading packages...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
              <p className="font-semibold">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-[#0a0a0c]">
                  <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 py-4">Package</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Details</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Pricing</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-500 font-medium">
                        No packages found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <TableRow key={pkg.packageId} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <TableCell>
                          <div className="font-bold text-zinc-900 dark:text-white">
                            {pkg.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {pkg.city} • {categories.find(c => c.categoryId === pkg.categoryId)?.name || pkg.categoryId}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-400 mt-1">ID: {pkg.packageId}</div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                             {pkg.durationHours} hrs • {pkg.distanceKm} km limit
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{pkg.basePrice.toLocaleString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {pkg.isActive ? (
                            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-bold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <MoreVertical className="w-4 h-4 text-zinc-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl font-outfit shadow-xl border-zinc-200 dark:border-zinc-800">
                              <DropdownMenuLabel className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                              <DropdownMenuItem onClick={() => { setFormData(pkg); setIsModalOpen(true); }} className="font-semibold cursor-pointer">
                                Edit Package
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPackageToDelete(pkg.packageId)} className="font-semibold cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] font-outfit rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">
              {packages.find(p => p.packageId === formData.packageId) ? "Edit Package" : "Add Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="id" className="font-bold">Package ID</Label>
              <Input
                id="id"
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                disabled={!!packages.find(p => p.packageId === formData.packageId)}
                placeholder="e.g. pkg_delhi_1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId" className="font-bold">Category ID</Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                placeholder="e.g. coffee_date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Package Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city" className="font-bold">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="price" className="font-bold">Base Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                  />
               </div>
               <div className="grid gap-2">
                  <Label htmlFor="duration" className="font-bold">Duration (hrs)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
                  />
               </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-zinc-800 text-white font-bold">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the package.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

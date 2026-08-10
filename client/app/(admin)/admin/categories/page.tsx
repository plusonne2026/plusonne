"use client";

import React, { useEffect, useState } from "react";
import { CategoriesAPI, Category } from "../../../lib/api/categories.api";
import {
  ExternalLink,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    categoryId: "",
    name: "",
    description: "",
    iconUrl: "",
    isActive: true,
    displayOrder: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriesAPI.getAll(true);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (categories.find(c => c.categoryId === formData.categoryId)) {
        await CategoriesAPI.update(formData.categoryId as string, formData);
      } else {
        await CategoriesAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(`Error saving category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await CategoriesAPI.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert(`Error deleting category: ${err.message}`);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-outfit">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <ExternalLink className="w-8 h-8 text-black dark:text-white" />
            Service Categories
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Manage the types of services available on the platform.
          </p>
        </div>
        <Button onClick={() => {
          setFormData({ categoryId: "", name: "", description: "", iconUrl: "", isActive: true, displayOrder: 0 });
          setIsModalOpen(true);
        }} className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-white/5 bg-white dark:bg-[#09090b] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-[#0a0a0c] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search categories..."
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
              <p className="font-medium text-sm">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
              <p className="font-semibold">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchCategories} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-[#0a0a0c]">
                  <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 py-4">ID</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Name</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                    <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-medium">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.categoryId} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <TableCell className="font-mono text-sm text-zinc-500">
                          {cat.categoryId}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-zinc-900 dark:text-white">
                            {cat.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate max-w-xs">
                            {cat.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cat.isActive ? (
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
                              <DropdownMenuItem onClick={() => { setFormData(cat); setIsModalOpen(true); }} className="font-semibold cursor-pointer">
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(cat.categoryId)} className="font-semibold cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10">
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
        <DialogContent className="sm:max-w-[425px] font-outfit rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">
              {categories.find(c => c.categoryId === formData.categoryId) ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="id" className="font-bold">Category ID</Label>
              <Input
                id="id"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={!!categories.find(c => c.categoryId === formData.categoryId)}
                placeholder="e.g. coffee_date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-bold">Description</Label>
              <Input
                id="desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-zinc-800 text-white font-bold">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Code {
  id: string;
  site: string;
  code: string;
  promoLink: string;
  reduction: string;
  expiresAt: string;
  creator: string;
  description?: string;
}

interface Creator {
  id: string;
  name: string;
}

export default function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    site: "",
    code: "",
    promoLink: "",
    reduction: "",
    expiresAt: "",
    description: "",
    creatorId: "",
  });

  useEffect(() => {
    fetchCodes();
    fetchCreators();
  }, []);

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`https://api.getpockitapp.com/api/admin/all-codes`, {
        credentials: 'include', 
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des codes");
      }
      
      const data = await response.json();
      setCodes(data.codes);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const response = await fetch(`https://api.getpockitapp.com/api/admin/users`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des créateurs:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      site: "",
      code: "",
      promoLink: "",
      reduction: "",
      expiresAt: "",
      description: "",
      creatorId: "",
    });
  };

  const handleEditCode = (code: Code) => {
    setEditingCode(code);
    const creator = creators.find(c => c.name === code.creator);
    setFormData({
      site: code.site,
      code: code.code,
      promoLink: code.promoLink || "",
      reduction: code.reduction,
      expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().split('T')[0] : "",
      description: code.description || "",
      creatorId: creator?.id || "",
    });
  };

  const handleAddCode = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `https://api.getpockitapp.com/api/admin/add-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du code");
      }
      
      await fetchCodes();
      setShowAddModal(false);
      resetForm();
      toast.success("Code ajouté avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'ajouter le code");
    }
  };

  const handleUpdateCode = async () => {
    if (!editingCode) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `https://api.getpockitapp.com/api/admin/update-code/${editingCode.id}`,
        {
          credentials:"include",
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du code");
      }
      
      await fetchCodes();
      setEditingCode(null);
      resetForm();
      toast.success("Code mis à jour avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour le code");
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `https://api.getpockitapp.com/api/admin/delete-code/${id}`,
        {
            credentials: 'include',
            method: "DELETE",
        }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du code");
      }
      
      setCodes(codes.filter((code) => code.id !== id));
      toast.success("Code supprimé avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer le code");
    }
  };

  const filteredCodes = codes.filter(
    (code) =>
      code.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-10">Chargement des codes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Codes Promo</h1>
        <div className="flex space-x-4">
          <div className="w-80">
            <Input
              placeholder="Rechercher un code, un site ou un créateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                Ajouter un code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau code</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du code promo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="site" className="text-right">Site*</Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="col-span-3"
                    placeholder="amazon.fr"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="col-span-3"
                    placeholder="PROMO20"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="promoLink" className="text-right">Lien</Label>
                  <Input
                    id="promoLink"
                    value={formData.promoLink}
                    onChange={(e) => setFormData({ ...formData, promoLink: e.target.value })}
                    className="col-span-3"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reduction" className="text-right">Réduction*</Label>
                  <Input
                    id="reduction"
                    value={formData.reduction}
                    onChange={(e) => setFormData({ ...formData, reduction: e.target.value })}
                    className="col-span-3"
                    placeholder="20% ou 10€"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">Expire le</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="creatorId" className="text-right">Créateur*</Label>
                  <Select
                    value={formData.creatorId}
                    onValueChange={(value) => setFormData({ ...formData, creatorId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un créateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Description du code promo"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCode}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Code/Lien</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Expire le</TableHead>
                <TableHead>Créateur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Aucun code trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.site}</TableCell>
                    <TableCell>
                      {code.code && code.code !== "" ? (
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                          {code.code}
                        </span>
                      ) : code.promoLink ? (
                        <a 
                          href={code.promoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Lien promo
                        </a>
                      ) : (
                        <span className="text-gray-400">Aucun code/lien</span>
                      )}
                    </TableCell>
                    <TableCell>{code.reduction}</TableCell>
                    <TableCell>
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : "Pas d'expiration"}
                    </TableCell>
                    <TableCell>{code.creator}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCode(code)}
                            >
                              Modifier
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Modifier le code</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-site" className="text-right">Site</Label>
                                <Input
                                  id="edit-site"
                                  value={formData.site}
                                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-code" className="text-right">Code</Label>
                                <Input
                                  id="edit-code"
                                  value={formData.code}
                                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-reduction" className="text-right">Réduction</Label>
                                <Input
                                  id="edit-reduction"
                                  value={formData.reduction}
                                  onChange={(e) => setFormData({ ...formData, reduction: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-expiresAt" className="text-right">Expire le</Label>
                                <Input
                                  id="edit-expiresAt"
                                  type="date"
                                  value={formData.expiresAt}
                                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateCode}>Sauvegarder</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}


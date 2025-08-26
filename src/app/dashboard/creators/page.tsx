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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatorCodesModal } from "@/components/modals/CreatorCodesModal";

interface Creator {
  id: string;
  name: string;
  subscriberCount: number;
  isActive: boolean;
  email: string | null;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isActive: true,
  });
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

      const fetchCreators = async () => {
      try {
        const response = await fetch(
          `https://api.getpockitapp.com/api/admin/users`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des créateurs");
        }

        const data = await response.json();
        setCreators(data.creators);
      } catch (error) {
        console.error("Erreur lors de la récupération des créateurs :", error);
        toast.error("Impossible de charger les créateurs");
      } finally {
        setLoading(false);
      }
    };


  const handleEditCreator = (creator: Creator) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name,
      email: creator.email || "",
      isActive: creator.isActive,
    });
  };

  const handleUpdateCreator = async () => {
    if (!editingCreator) return;

    try {
      const token = localStorage.getItem("adminToken"); // Changer de "admin_token" à "adminToken"
      const response = await fetch(
        `https://api.getpockitapp.com/api/admin/update-creator/${editingCreator.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du créateur");
      }

      // Refresh the creators list
      await fetchCreators();
      setEditingCreator(null);
      toast.success("Créateur mis à jour avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour le créateur");
    }
  };

  const handleDisableCreator = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken"); // Changer de "admin_token" à "adminToken"
      const response = await fetch(
        `https://api.getpockitapp.com/api/admin/disable-creator/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la désactivation du créateur");
      }

      await fetchCreators();
      toast.success("Créateur désactivé avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de désactiver le créateur");
    }
  };

  const openModal = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCreatorId(null);
    setIsModalOpen(false);
  };

  const filteredCreators = creators.filter((creator) =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-10">Chargement des créateurs...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Créateurs</h1>
        <div className="w-1/3">
          <Input
            placeholder="Rechercher un créateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Abonnés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucun créateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCreators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell className="font-medium">{creator.name}</TableCell>
                    <TableCell>{creator.email || "Non renseigné"}</TableCell>
                    <TableCell>{creator.subscriberCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                          creator.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {creator.isActive ? "Actif" : "Inactif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCreator(creator)}
                            >
                              Modifier
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier le créateur</DialogTitle>
                              <DialogDescription>
                                Modifiez les informations du créateur
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Nom
                                </Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateCreator}>
                                Sauvegarder
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => openModal(creator.id)}
                          variant="outline"
                          size="sm"
                        >
                          Voir les codes
                        </Button>

                        {creator.isActive ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisableCreator(creator.id)}
                          >
                            Désactiver
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Désactivé
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreatorCodesModal
        creatorId={selectedCreatorId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Toaster />
    </div>
  );
}

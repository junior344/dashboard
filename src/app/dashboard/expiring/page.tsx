"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface Code {
  id: string;
  site: string;
  code: string;
  promoLink?: string;
  reduction: string;
  expiresAt: string;
  creator: string;
  daysLeft: number;
}

export default function ExpiringCodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringCodes = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/expiring-codes`, {
          credentials: 'include', // Inclure les cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des codes");
        }
        
        const data = await response.json();
        setCodes(data.codes);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger les codes expirants");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringCodes();
  }, []);

  const handleDeleteCode = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/delete-code/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  if (loading) {
    return <div className="text-center py-10">Chargement des codes expirant bientôt...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Codes Expirant Bientôt</h1>
      <p className="text-muted-foreground mb-4">
        Codes expirant dans les 2 prochaines semaines
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Code/Lien</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Expire dans</TableHead>
                <TableHead>Date d'expiration</TableHead>
                <TableHead>Créateur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Aucun code n'expire dans les 2 prochaines semaines
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((code) => (
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
                      <span 
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                          code.daysLeft <= 3 
                            ? "bg-red-100 text-red-800" 
                            : code.daysLeft <= 7 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {code.daysLeft} jour{code.daysLeft > 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(code.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{code.creator}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        Supprimer
                      </Button>
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
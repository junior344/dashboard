'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"



interface CreatorCodesModalProps {
  creatorId: string | null
  isOpen: boolean
  onClose: () => void
}

export function CreatorCodesModal({ creatorId, isOpen, onClose }: CreatorCodesModalProps) {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (creatorId && isOpen) {
      fetchCreatorCodes()
    }
  }, [creatorId, isOpen])

  const fetchCreatorCodes = async () => {
    if (!creatorId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      const response = await fetch(`https://api.getpockitapp.com/api/admin/creator-codes/${creatorId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);

        if (response.status === 401) {
          toast.error('Token invalide ou expiré');
          localStorage.removeItem('adminToken');
        } else if (response.status === 403) {
          toast.error('Accès refusé - Droits admin requis');
        } else {
          toast.error('Impossible de charger les codes du créateur');
        }
      }
    } catch (error) {
      console.error('Error fetching creator codes:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Codes liés au créateur</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Expire le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>{code.site}</TableCell>
                  <TableCell>{code.code || 'N/A'}</TableCell>
                  <TableCell>{code.reduction}</TableCell>
                  <TableCell>
                    <Badge variant={code.isExpired ? 'destructive' : 'default'}>
                      {code.isExpired ? 'Expiré' : 'Actif'}
                    </Badge>
                  </TableCell>
                  <TableCell>{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
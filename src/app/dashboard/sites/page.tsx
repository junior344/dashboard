"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SiteStats {
  site: string;
  codeCount: number;
  activeCodeCount: number;
  avgReduction: string;
  mostUsedCreator: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<SiteStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/site-stats`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setSites(data.sites);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger les statistiques des sites");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        Chargement des statistiques par site...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistiques par Site</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 5 des sites avec le plus de codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sites.slice(0, 5).map((site, index) => (
              <div key={site.site} className="flex items-center">
                <div className="w-12 text-sm font-medium">{index + 1}.</div>
                <div className="flex-1">{site.site}</div>
                <div className="w-16 text-right font-bold">{site.codeCount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Total codes</TableHead>
                <TableHead>Codes actifs</TableHead>
                <TableHead>Réduction moyenne</TableHead>
                <TableHead>Créateur principal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucune statistique disponible
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
                  <TableRow key={site.site}>
                    <TableCell className="font-medium">{site.site}</TableCell>
                    <TableCell>{site.codeCount}</TableCell>
                    <TableCell>
                      {site.activeCodeCount}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((site.activeCodeCount / site.codeCount) * 100)}
                        %)
                      </span>
                    </TableCell>
                    <TableCell>{site.avgReduction}</TableCell>
                    <TableCell>{site.mostUsedCreator}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

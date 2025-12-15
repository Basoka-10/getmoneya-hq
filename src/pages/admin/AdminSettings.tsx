import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Globe, Shield, Wrench, DollarSign } from "lucide-react";

const settingIcons: Record<string, React.ElementType> = {
  supported_currencies: DollarSign,
  default_currency: Globe,
  maintenance_mode: Wrench,
  beta_mode: Shield,
};

const settingLabels: Record<string, string> = {
  supported_currencies: "Devises supportées",
  default_currency: "Devise par défaut",
  maintenance_mode: "Mode maintenance",
  beta_mode: "Mode beta",
};

export default function AdminSettings() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const handleToggle = (id: string, currentValue: unknown) => {
    const boolValue = currentValue === true || currentValue === "true";
    updateSetting.mutate({ id, setting_value: !boolValue });
  };

  const getSupportedCurrencies = () => {
    const currencySetting = settings?.find((s) => s.setting_key === "supported_currencies");
    if (currencySetting) {
      try {
        const value = currencySetting.setting_value;
        if (Array.isArray(value)) return value;
        if (typeof value === "string") return JSON.parse(value);
      } catch {
        return ["EUR", "USD", "XOF"];
      }
    }
    return ["EUR", "USD", "XOF"];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres système</h1>
        <p className="text-muted-foreground">Configuration globale de MONEYA</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mode Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Modes du système
            </CardTitle>
            <CardDescription>Activer ou désactiver les modes système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : (
              <>
                {settings
                  ?.filter((s) => s.setting_key === "beta_mode" || s.setting_key === "maintenance_mode")
                  .map((setting) => {
                    const Icon = settingIcons[setting.setting_key] || Settings;
                    const isEnabled = setting.setting_value === true || setting.setting_value === "true";
                    
                    return (
                      <div key={setting.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor={setting.id} className="cursor-pointer">
                              {settingLabels[setting.setting_key]}
                            </Label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          </div>
                        </div>
                        <Switch
                          id={setting.id}
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(setting.id, setting.setting_value)}
                          disabled={updateSetting.isPending}
                        />
                      </div>
                    );
                  })}
              </>
            )}
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Devises
            </CardTitle>
            <CardDescription>Configuration des devises supportées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div>
                  <Label className="text-sm text-muted-foreground">Devises actives</Label>
                  <div className="flex gap-2 mt-2">
                    {getSupportedCurrencies().map((currency: string) => (
                      <Badge key={currency} variant="secondary" className="text-sm">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Devise par défaut</Label>
                  <div className="mt-2">
                    <Badge variant="default">
                      {settings?.find((s) => s.setting_key === "default_currency")?.setting_value?.toString().replace(/"/g, "") || "EUR"}
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Les taux de change sont mis à jour automatiquement via l'API Open Exchange Rates.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">1.0.0 BETA</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Paiements</p>
              <p className="text-lg font-semibold text-yellow-600">Désactivés</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Base de données</p>
              <p className="text-lg font-semibold text-green-600">Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

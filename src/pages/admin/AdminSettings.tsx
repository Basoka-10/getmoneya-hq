import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Globe, Shield, Wrench, DollarSign, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

// All available currencies that can be enabled
const ALL_CURRENCIES: Record<string, { symbol: string; name: string }> = {
  EUR: { symbol: "€", name: "Euro" },
  USD: { symbol: "$", name: "US Dollar" },
  XOF: { symbol: "FCFA", name: "Franc CFA (UEMOA)" },
  XAF: { symbol: "FCFA", name: "Franc CFA (CEMAC)" },
  GBP: { symbol: "£", name: "Livre Sterling" },
  CHF: { symbol: "CHF", name: "Franc Suisse" },
  CAD: { symbol: "CA$", name: "Dollar Canadien" },
  MAD: { symbol: "DH", name: "Dirham Marocain" },
  TND: { symbol: "DT", name: "Dinar Tunisien" },
  DZD: { symbol: "DA", name: "Dinar Algérien" },
  NGN: { symbol: "₦", name: "Naira Nigérian" },
  GHS: { symbol: "₵", name: "Cedi Ghanéen" },
  KES: { symbol: "KSh", name: "Shilling Kenyan" },
  ZAR: { symbol: "R", name: "Rand Sud-Africain" },
};

export default function AdminSettings() {
  const { data: settings, isLoading, refetch } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const [selectedCurrencyToAdd, setSelectedCurrencyToAdd] = useState<string>("");

  const handleToggle = (id: string, currentValue: unknown) => {
    const boolValue = currentValue === true || currentValue === "true";
    updateSetting.mutate({ id, setting_value: !boolValue });
  };

  const getSupportedCurrencies = (): string[] => {
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

  const getDefaultCurrency = (): string => {
    const setting = settings?.find((s) => s.setting_key === "default_currency");
    if (setting) {
      const value = setting.setting_value;
      if (typeof value === "string") return value.replace(/"/g, "");
      return String(value);
    }
    return "EUR";
  };

  const handleAddCurrency = async () => {
    if (!selectedCurrencyToAdd) return;
    
    const currentCurrencies = getSupportedCurrencies();
    if (currentCurrencies.includes(selectedCurrencyToAdd)) {
      toast.error("Cette devise est déjà activée");
      return;
    }

    const currencySetting = settings?.find((s) => s.setting_key === "supported_currencies");
    if (!currencySetting) return;

    const newCurrencies = [...currentCurrencies, selectedCurrencyToAdd];
    
    updateSetting.mutate(
      { id: currencySetting.id, setting_value: newCurrencies },
      {
        onSuccess: () => {
          toast.success(`${ALL_CURRENCIES[selectedCurrencyToAdd]?.name || selectedCurrencyToAdd} activée`);
          setSelectedCurrencyToAdd("");
          refetch();
        },
        onError: () => {
          toast.error("Erreur lors de l'ajout de la devise");
        },
      }
    );
  };

  const handleRemoveCurrency = async (currencyToRemove: string) => {
    const currentCurrencies = getSupportedCurrencies();
    const defaultCurrency = getDefaultCurrency();

    if (currencyToRemove === defaultCurrency) {
      toast.error("Impossible de supprimer la devise par défaut");
      return;
    }

    if (currentCurrencies.length <= 1) {
      toast.error("Au moins une devise doit rester active");
      return;
    }

    const currencySetting = settings?.find((s) => s.setting_key === "supported_currencies");
    if (!currencySetting) return;

    const newCurrencies = currentCurrencies.filter((c) => c !== currencyToRemove);
    
    updateSetting.mutate(
      { id: currencySetting.id, setting_value: newCurrencies },
      {
        onSuccess: () => {
          toast.success(`${ALL_CURRENCIES[currencyToRemove]?.name || currencyToRemove} désactivée`);
          refetch();
        },
        onError: () => {
          toast.error("Erreur lors de la suppression de la devise");
        },
      }
    );
  };

  const handleChangeDefaultCurrency = async (newDefault: string) => {
    const defaultSetting = settings?.find((s) => s.setting_key === "default_currency");
    if (!defaultSetting) return;

    updateSetting.mutate(
      { id: defaultSetting.id, setting_value: newDefault },
      {
        onSuccess: () => {
          toast.success(`Devise par défaut changée en ${ALL_CURRENCIES[newDefault]?.name || newDefault}`);
          refetch();
        },
        onError: () => {
          toast.error("Erreur lors du changement de devise par défaut");
        },
      }
    );
  };

  const supportedCurrencies = getSupportedCurrencies();
  const defaultCurrency = getDefaultCurrency();
  const availableCurrenciesToAdd = Object.keys(ALL_CURRENCIES).filter(
    (c) => !supportedCurrencies.includes(c)
  );

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
              Gestion des devises
            </CardTitle>
            <CardDescription>Activer/désactiver des devises pour tous les utilisateurs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                {/* Active currencies */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">Devises actives</Label>
                  <div className="flex flex-wrap gap-2">
                    {supportedCurrencies.map((currency: string) => (
                      <Badge 
                        key={currency} 
                        variant={currency === defaultCurrency ? "default" : "secondary"} 
                        className="text-sm flex items-center gap-1 pr-1"
                      >
                        <span>{ALL_CURRENCIES[currency]?.symbol || currency}</span>
                        <span>{currency}</span>
                        {currency !== defaultCurrency && (
                          <button
                            onClick={() => handleRemoveCurrency(currency)}
                            className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                            disabled={updateSetting.isPending}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Add currency */}
                {availableCurrenciesToAdd.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Ajouter une devise</Label>
                    <div className="flex gap-2">
                      <Select value={selectedCurrencyToAdd} onValueChange={setSelectedCurrencyToAdd}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCurrenciesToAdd.map((code) => (
                            <SelectItem key={code} value={code}>
                              {ALL_CURRENCIES[code].symbol} - {ALL_CURRENCIES[code].name} ({code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddCurrency} 
                        disabled={!selectedCurrencyToAdd || updateSetting.isPending}
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Default currency */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Devise par défaut</Label>
                  <Select value={defaultCurrency} onValueChange={handleChangeDefaultCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map((code: string) => (
                        <SelectItem key={code} value={code}>
                          {ALL_CURRENCIES[code]?.symbol || code} - {ALL_CURRENCIES[code]?.name || code} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Les modifications s'appliquent immédiatement à tous les utilisateurs. Les taux de change sont mis à jour via l'API Open Exchange Rates.
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

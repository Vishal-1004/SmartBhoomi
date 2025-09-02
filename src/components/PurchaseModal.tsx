import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { IndianRupee, Package, User, MapPin, Calendar, AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from './LanguageContext';

interface PurchaseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onPurchaseSuccess: (purchase: any) => void;
  accessToken?: string;
}

export function PurchaseModal({ isOpen, onOpenChange, product, onPurchaseSuccess, accessToken }: PurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const { t } = useLanguage();

  const totalPrice = product ? (product.price * quantity) : 0;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!accessToken) {
      setError(t('signin') + ' to purchase products');
      setLoading(false);
      return;
    }

    if (!deliveryAddress.trim()) {
      setError(t('addressRequired'));
      setLoading(false);
      return;
    }

    if (quantity <= 0 || quantity > (product.quantity || 100)) {
      setError(`Please enter a valid quantity (1-${product.quantity || 100})`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2a067818/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          deliveryAddress,
          totalPrice
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(`Failed to purchase product: ${result.error || 'Unknown error'}`);
        return;
      }

      setSuccess('Product purchased successfully! You will receive delivery updates soon.');
      onPurchaseSuccess(result.purchase);
      
      setTimeout(() => {
        onOpenChange(false);
        setSuccess('');
        setQuantity(1);
        setDeliveryAddress('');
      }, 2000);

    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to purchase product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-green-600" />
            {t('purchaseProduct')}
          </DialogTitle>
          <DialogDescription>
            {t('purchase')} {product.name}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Product Summary */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">ID: {product.id}</p>
            </div>
            <Badge variant="outline">{product.quality}</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4 text-gray-400" />
              <span>{product.farmer || product.farmerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-gray-400" />
              <span>{product.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-400" />
              <span>{product.harvestDate}</span>
            </div>
            <div className="space-y-1">
              {product.originalPrice && product.handlingCharge > 0 ? (
                <>
                  <div className="text-xs text-gray-500">
                    {t('farmerPrice')}: ₹{product.originalPrice}/kg
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('handlingCharge')}: +₹{product.handlingCharge}/kg
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <IndianRupee className="size-4 text-gray-400" />
                    <span>₹{product.price}/kg (Total)</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <IndianRupee className="size-4 text-gray-400" />
                  <span>₹{product.price}/kg</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <Label htmlFor="quantity">{t('quantity')} (kg)</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              max={product.quantity || 100}
              step="0.1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {product.quantity || 100} kg
            </p>
          </div>

          <div>
            <Label htmlFor="delivery-address">{t('deliveryAddress')}</Label>
            <Input
              id="delivery-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={t('enterAddress')}
              required
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span>{t('quantity')}:</span>
              <span>{quantity} kg</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>{t('pricePerKg')}:</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between items-center font-medium text-lg">
              <span>{t('totalAmount')}:</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="size-4" />
                {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('purchasing') : t('confirmPurchase')}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p className="flex items-center gap-1">
            <Package className="size-3" />
            Payment will be processed securely. You'll receive delivery updates via the platform.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
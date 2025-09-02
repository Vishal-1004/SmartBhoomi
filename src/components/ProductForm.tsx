import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar, Package, AlertTriangle, CheckCircle, Upload, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from './LanguageContext';

interface ProductFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: any) => void;
  accessToken?: string;
  userProfile?: any;
}

export function ProductForm({ isOpen, onOpenChange, onProductCreated, accessToken, userProfile }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    harvestDate: '',
    quantity: '',
    price: '',
    quality: '',
    description: '',
    handlingCharge: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const productCategories = [
    { key: 'vegetables', label: t('vegetables') },
    { key: 'fruits', label: t('fruits') },
    { key: 'grains', label: t('grains') },
    { key: 'spices', label: t('spices') }
  ];

  const qualityGrades = [
    { key: 'gradeA', label: t('gradeA') },
    { key: 'gradeB', label: t('gradeB') },
    { key: 'premium', label: t('premium') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!accessToken) {
      setError('Please sign in to create products');
      setLoading(false);
      return;
    }

    // Validate form
    if (!formData.name || !formData.category || !formData.harvestDate || !formData.quantity || !formData.price || !formData.quality) {
      setError(t('allFieldsRequired'));
      setLoading(false);
      return;
    }

    // For non-farmers, handling charge is required
    if (userProfile?.userType !== 'farmer' && !formData.handlingCharge) {
      setError(t('validHandlingCharge'));
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'quantity' || key === 'price' || key === 'handlingCharge') {
          uploadData.append(key, parseFloat(formData[key]) || 0);
        } else {
          uploadData.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (selectedImage) {
        uploadData.append('productImage', selectedImage);
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2a067818/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: uploadData
      });

      const result = await response.json();

      if (!response.ok) {
        setError(`Failed to create product: ${result.error || 'Unknown error'}`);
        return;
      }

      setSuccess('Product created successfully!');
      onProductCreated(result.product);
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        harvestDate: '',
        quantity: '',
        price: '',
        quality: '',
        description: '',
        handlingCharge: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
      
      setTimeout(() => {
        onOpenChange(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Create product error:', err);
      setError('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-green-600" />
            {userProfile?.userType === 'farmer' ? 'Register New Product' : 'Add Product to Inventory'}
          </DialogTitle>
          <DialogDescription>
            {userProfile?.userType === 'farmer' 
              ? 'Add your agricultural produce to the blockchain supply chain'
              : 'Add products to your inventory with handling charges'
            }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="product-name">{t('productName')} *</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">{t('category')} *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="harvest-date">Harvest Date *</Label>
              <Input
                id="harvest-date"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => handleChange('harvestDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="100"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price per kg (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="50"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="quality">Quality Grade *</Label>
              <Select value={formData.quality} onValueChange={(value) => handleChange('quality', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality grade" />
                </SelectTrigger>
                <SelectContent>
                  {qualityGrades.map((grade) => (
                    <SelectItem key={grade.key} value={grade.key}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Image Upload */}
            <div className="col-span-2">
              <Label htmlFor="product-image">Product Image (Optional)</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload product image</p>
                    <Input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('product-image')?.click()}
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            {/* Handling Charge for non-farmers */}
            {userProfile?.userType !== 'farmer' && (
              <div className="col-span-2">
                <Label htmlFor="handling-charge">Handling Charge per kg (₹) *</Label>
                <Input
                  id="handling-charge"
                  type="number"
                  value={formData.handlingCharge}
                  onChange={(e) => handleChange('handlingCharge', e.target.value)}
                  placeholder="Your handling/processing charge"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be added to the farmer's original price
                </p>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Additional details about your product..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p className="flex items-center gap-1">
            <Calendar className="size-3" />
            Products are automatically registered on the blockchain upon creation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
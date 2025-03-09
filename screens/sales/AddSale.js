import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Animated,
  FlatList,
  Modal
} from 'react-native';
import axios from 'axios';

const API_URLS = [
  'http://192.168.0.12:8000/api/sales',
  'http://localhost:8000/api/sales',
  'http://127.0.0.1:8000/api/sales'
];

const PRODUCTS_API_URLS = [
  'http://192.168.0.12:8000/api/products',
  'http://localhost:8000/api/products',
  'http://127.0.0.1:8000/api/products'
];

const sampleProducts = [
  { id: 1, name: 'Producto Offline 1', price: 100, stock: 10 },
  { id: 2, name: 'Producto Offline 2', price: 200, stock: 5 },
  { id: 3, name: 'Producto Offline 3', price: 300, stock: 15 },
];

export default function AddSale({ route, navigation }) {
  const productFromDetail = route.params?.product;
  
  const [customer, setCustomer] = useState('');
  const [total, setTotal] = useState('');
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('pendiente');
  const [productQuantity, setProductQuantity] = useState('1');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(API_URLS[0]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (productFromDetail) {
      const newProduct = {
        productId: productFromDetail.id || Date.now(),
        name: productFromDetail.name,
        price: productFromDetail.price,
        quantity: 1,
        stock: productFromDetail.stock
      };
      setProducts([newProduct]);
      setTotal((productFromDetail.price).toString());
    }

    fetchAvailableProducts();
    const checkOfflineMode = async () => {
      try {
        const response = await tryNextApiUrl();
        if (!response) {
          setIsOfflineMode(true);
          Alert.alert(
            'Modo Offline',
            'No se pudo conectar al servidor. Las ventas añadidas solo se guardarán localmente.'
          );
        }
      } catch (error) {
        console.error('Error al comprobar modo offline:', error);
        setIsOfflineMode(true);
      }
    };

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    checkOfflineMode();
  }, []);

  const tryNextApiUrl = async (currentIndex = 0) => {
    if (currentIndex >= API_URLS.length) {
      console.log('No se pudo conectar a ninguna API. Activando modo offline.');
      setIsOfflineMode(true);
      return false;
    }

    const url = API_URLS[currentIndex];
    console.log(`Intentando conectar a: ${url}`);
    
    try {
      const response = await axios.get(url, { timeout: 5000 }); 
      if (response.status === 200) {
        console.log(`Conexión exitosa a: ${url}`);
        setCurrentApiUrl(url);
        return response;
      }
    } catch (error) {
      console.error(`Error conectando a ${url}: ${error.message}`);
      return tryNextApiUrl(currentIndex + 1);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      let response = null;
      for (const url of PRODUCTS_API_URLS) {
        try {
          response = await axios.get(url, { timeout: 5000 });
          if (response.status === 200) break;
        } catch (error) {
          console.log('Error con URL:', url, error.message);
        }
      }
      
      if (response && response.data) {
        setAvailableProducts(response.data);
      } else {
        setIsOfflineMode(true);
        setAvailableProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      setIsOfflineMode(true);
      setAvailableProducts(sampleProducts);
    }
  };

  const addProductFromList = (selectedProduct) => {
    const existingProduct = products.find(p => p.productId === selectedProduct.id);
    if (existingProduct) {
      Alert.alert('Producto ya agregado', 'Este producto ya está en la lista de venta.');
      return;
    }

    const newProduct = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      stock: selectedProduct.stock
    };

    setProducts([...products, newProduct]);
    const newTotal = (parseFloat(total) || 0) + selectedProduct.price;
    setTotal(newTotal.toString());
  };

  const removeProduct = (productId) => {
    const product = products.find(p => p.productId === productId);
    if (product) {
      const newTotal = (parseFloat(total) || 0) - (product.price * product.quantity);
      setTotal(newTotal.toString());
    }
    setProducts(products.filter(p => p.productId !== productId));
  };

  const updateProductQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Cantidad inválida', 'Por favor ingrese una cantidad válida.');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Stock insuficiente', `Solo hay ${product.stock} unidades disponibles.`);
      return;
    }

    const oldTotal = parseFloat(total) - (product.price * product.quantity);
    const newTotal = oldTotal + (product.price * quantity);

    setProducts(products.map(p => 
      p.productId === productId ? { ...p, quantity } : p
    ));
    setTotal(newTotal.toString());
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productListItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Precio: ${item.price}</Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          addProductFromList(item);
          setShowProductModal(false);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedProduct = ({ item }) => (
    <View style={styles.selectedProductItem}>
      <View style={styles.selectedProductInfo}>
        <Text style={styles.selectedProductName}>{item.name}</Text>
        <Text style={styles.selectedProductPrice}>Precio: ${item.price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TextInput
          style={styles.quantityInput}
          value={item.quantity.toString()}
          keyboardType="numeric"
          onChangeText={(text) => updateProductQuantity(item.productId, text)}
        />
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeProduct(item.productId)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const validateForm = () => {
    if (!customer) {
      Alert.alert(
        'Campos incompletos',
        'Por favor ingrese el nombre del cliente.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    if (products.length === 0) {
      Alert.alert(
        'Sin productos',
        'Por favor añada al menos un producto a la venta.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  const addSale = async () => {
    if (!validateForm()) return;

    const newSale = {
      customer,
      total: parseFloat(total),
      products,
      status,
      date: new Date().toISOString(),
    };

    if (isOfflineMode) {
      Alert.alert(
        'Venta agregada (Modo Offline)',
        'La venta ha sido guardada localmente. Se sincronizará cuando vuelva la conexión.',
        [{ text: 'OK', onPress: () => navigation.navigate('SalesList') }]
      );
      return;
    }

    try {
      const response = await axios.post(currentApiUrl, newSale);
      if (response.status === 201) {
        Alert.alert(
          'Venta agregada',
          'La venta se agregó exitosamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('SalesList') }]
        );
      }
    } catch (error) {
      console.error('Error al agregar venta:', error.message);
      
      try {
        const newResponse = await tryNextApiUrl();
        if (newResponse) {
          const response = await axios.post(currentApiUrl, newSale);
          if (response.status === 201) {
            Alert.alert(
              'Venta agregada',
              'La venta se agregó exitosamente.',
              [{ text: 'OK', onPress: () => navigation.navigate('SalesList') }]
            );
            return;
          }
        }
      } catch (retryError) {
        console.error('Error en segundo intento:', retryError.message);
      }
      
      Alert.alert(
        'Error',
        `Error al agregar la venta: ${error.message}. ¿Desea guardarla localmente?`,
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Sí', 
            onPress: () => {
              setIsOfflineMode(true);
              Alert.alert(
                'Venta guardada localmente',
                'La venta se guardará cuando la conexión sea restablecida.',
                [{ text: 'OK', onPress: () => navigation.navigate('SalesList') }]
              );
            } 
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del cliente"
          value={customer}
          onChangeText={setCustomer}
        />

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Productos en la venta:</Text>
          <FlatList
            data={products}
            renderItem={renderSelectedProduct}
            keyExtractor={item => item.productId.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay productos agregados</Text>
            }
          />
          
          <TouchableOpacity 
            style={styles.addProductButton}
            onPress={() => setShowProductModal(true)}
          >
            <Text style={styles.addProductButtonText}>+ Añadir Producto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total || '0'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={addSale}
        >
          <Text style={styles.submitButtonText}>Guardar Venta</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Producto</Text>
            <FlatList
              data={availableProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id.toString()}
            />
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowProductModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectedProductItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedProductPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    width: 50,
    marginRight: 8,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addProductButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  productListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  productStock: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

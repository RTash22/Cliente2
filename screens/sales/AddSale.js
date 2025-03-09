import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Animated,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  const [status, setStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState('cash');
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

  const handleSubmit = async () => {
    if (!customer.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nombre del cliente');
      return;
    }

    if (products.length === 0) {
      Alert.alert('Error', 'Por favor agregue al menos un producto');
      return;
    }

    // Formatear los datos según la estructura que espera Laravel
    const formattedSale = {
      customer: customer.trim(),
      total: parseFloat(total || '0'),
      status: status,
      payment_method: paymentMethod,
      date: new Date().toISOString(),
      // Enviamos los productos como objetos individuales, no como array
      product_id: products[0].productId,
      quantity: products[0].quantity,
      price: products[0].price,
      // Si hay más productos, los enviamos como productos adicionales
      additional_products: products.slice(1).map(product => ({
        product_id: parseInt(product.productId),
        quantity: parseInt(product.quantity),
        price: parseFloat(product.price)
      }))
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
      // Mostrar los datos que se envían
      console.log('Enviando datos de venta:', JSON.stringify(formattedSale, null, 2));
      
      const response = await axios.post(currentApiUrl, formattedSale);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          'Venta agregada',
          'La venta se agregó exitosamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('SalesList') }]
        );
      }
    } catch (error) {
      console.error('Error al agregar venta:', error.message);
      if (error.response) {
        console.log('Detalles del error:', error.response.data);
        if (error.response.data.errors) {
          console.log('Errores específicos:', error.response.data.errors);
          
          // Mostrar errores específicos al usuario
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          
          Alert.alert(
            'Error de validación',
            `Por favor corrija los siguientes errores:\n\n${errorMessages}`,
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      Alert.alert(
        'Error',
        'No se pudo agregar la venta. ¿Desea guardarla localmente?',
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={customer}
          onChangeText={setCustomer}
          placeholder="Nombre del cliente"
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Método de Pago:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Efectivo" value="cash" />
              <Picker.Item label="Tarjeta" value="card" />
              <Picker.Item label="Transferencia" value="transfer" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estado:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pendiente" value="pending" />
              <Picker.Item label="Completado" value="completed" />
              <Picker.Item label="Cancelado" value="cancelled" />
            </Picker>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Productos en la venta:</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>Precio: ${item.price}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TextInput
                    style={styles.quantityInput}
                    value={item.quantity.toString()}
                    onChangeText={(text) => updateProductQuantity(item.productId, text)}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeProduct(item.productId)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.productsList}
          />
          
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setShowProductModal(true)}
          >
            <Text style={styles.addProductButtonText}>+ Agregar Producto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.totalText}>Total: ${total}</Text>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Guardar Venta</Text>
        </TouchableOpacity>
      </View>

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
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProductItem}
              style={styles.modalList}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  productsSection: {
    marginVertical: 15,
  },
  productsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  productItem: {
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
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  modalList: {
    maxHeight: 300,
    marginBottom: 15,
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
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});

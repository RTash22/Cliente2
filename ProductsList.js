import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');
// URLs para intentar conectarse al servidor (prueba con varias opciones)
const API_URLS = [
  'http://192.168.0.12:8000/api/products',
  'http://localhost:8000/api/products',
  'http://127.0.0.1:8000/api/products'
];

// Datos de muestra para modo offline
const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Producto de ejemplo 1', price: '100', stock: 10, description: 'Descripción de ejemplo 1', category: 'Categoría 1' },
  { id: 2, name: 'Producto de ejemplo 2', price: '200', stock: 20, description: 'Descripción de ejemplo 2', category: 'Categoría 2' },
  { id: 3, name: 'Producto de ejemplo 3', price: '300', stock: 30, description: 'Descripción de ejemplo 3', category: 'Categoría 3' },
];

export default function ProductsList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [testResult, setTestResult] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(API_URLS[0]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchProducts();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Esto evita advertencias en la versión web
    }).start();
  }, []);

  const tryNextApiUrl = async (currentIndex = 0) => {
    // Si ya probamos todas las URLs, activamos el modo offline
    if (currentIndex >= API_URLS.length) {
      console.log('No se pudo conectar a ninguna API. Activando modo offline.');
      setIsOfflineMode(true);
      setProducts(SAMPLE_PRODUCTS);
      return false;
    }

    const url = API_URLS[currentIndex];
    console.log(`Intentando conectar a: ${url}`);
    
    try {
      const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5 segundos
      if (response.status === 200) {
        console.log(`Conexión exitosa a: ${url}`);
        setCurrentApiUrl(url);
        return response;
      }
    } catch (error) {
      console.error(`Error conectando a ${url}: ${error.message}`);
      // Intentamos con la siguiente URL
      return tryNextApiUrl(currentIndex + 1);
    }
  };

  const fetchProducts = async () => {
    console.log('Iniciando la carga de productos...');
    setRefreshing(true);
    
    try {
      if (isOfflineMode) {
        console.log('Usando datos de muestra (modo offline)');
        setProducts(SAMPLE_PRODUCTS);
      } else {
        const response = await tryNextApiUrl();
        if (response && response.data) {
          console.log('Productos obtenidos:', response.data);
          setProducts(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      Alert.alert(
        'Error',
        'No se pudieron cargar los productos. ' + error.message
      );
    } finally {
      setRefreshing(false);
      console.log('Finalizó la carga de productos.');
    }
  };

  const testConnection = async () => {
    console.log('Probando conexión a la API...');
    try {
      const response = await tryNextApiUrl();
      if (response && response.status === 200) {
        console.log('Conexión exitosa a la API');
        setTestResult('Conexión exitosa a la API');
        setIsOfflineMode(false);
        Alert.alert('Éxito', `Conexión exitosa a la API: ${currentApiUrl}`);
        fetchProducts(); // Recargamos los productos con la conexión exitosa
      } else {
        throw new Error('No se pudo conectar a ninguna API');
      }
    } catch (error) {
      const errorMsg = `Error en la conexión: ${error.message}`;
      console.error(errorMsg);
      setTestResult(errorMsg);
      Alert.alert('Error', 'No se pudo conectar al servidor. Activando modo offline.', [
        { 
          text: 'OK',
          onPress: () => {
            setIsOfflineMode(true);
            setProducts(SAMPLE_PRODUCTS);
          }
        }
      ]);
    }
  };

  const toggleOfflineMode = () => {
    const newMode = !isOfflineMode;
    setIsOfflineMode(newMode);
    if (newMode) {
      setProducts(SAMPLE_PRODUCTS);
      Alert.alert('Modo Offline', 'Ahora estás usando datos de muestra.');
    } else {
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (isOfflineMode) {
      // En modo offline, solo simulamos la eliminación
      setProducts(products.filter(product => product.id !== id));
      Alert.alert(
        "Éxito (Modo Offline)",
        "El producto se eliminó de la lista local",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await axios.delete(`${currentApiUrl}/${id}`);
      setProducts(products.filter(product => product.id !== id));
      Alert.alert(
        "Éxito",
        "El producto se eliminó correctamente",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error(`Error al eliminar el producto: ${error.message}`);
      Alert.alert(
        "Error",
        "No se pudo eliminar el producto. " + error.message,
        [{ text: "OK" }]
      );
    }
  };

  // Prerenderizamos las animaciones fuera de renderItem para cumplir con las reglas de hooks
  const slideAnimations = products.map((_, index) => {
    const anim = new Animated.Value(width);
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      delay: index * 100,
      useNativeDriver: false,
    }).start();
    return anim;
  });

  const renderItem = ({ item, index }) => {
    return (
      <Animated.View 
        style={[
          styles.item,
          {
            transform: [{ translateX: slideAnimations[index] || new Animated.Value(0) }],
            opacity: fadeAnim
          }
        ]}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>Precio: ${item.price}</Text>
          <Text style={styles.itemStock}>Stock: {item.stock}</Text>
          {isOfflineMode && <Text style={styles.offlineTag}>Offline</Text>}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Text style={styles.buttonText}>Ver Detalle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProduct(item.id)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Lista de Productos {isOfflineMode ? '(Offline)' : ''}
      </Animated.Text>
      {testResult !== '' && (
        <Animated.Text style={[styles.testResult, { opacity: fadeAnim }]}>
          {testResult}
        </Animated.Text>
      )}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onRefresh={fetchProducts}
        refreshing={refreshing}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchProducts}
            >
              <Text style={styles.buttonText}>Refrescar</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={testConnection}
        >
          <Text style={styles.buttonText}>Probar conexión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.offlineButton}
          onPress={toggleOfflineMode}
        >
          <Text style={styles.buttonText}>
            {isOfflineMode ? 'Modo Online' : 'Modo Offline'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.buttonText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  testResult: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: 'green',
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  itemContent: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  itemStock: {
    fontSize: 14,
    color: '#888',
  },
  offlineTag: {
    fontSize: 12,
    color: '#ff6347',
    fontStyle: 'italic',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  detailButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  floatingButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  offlineButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  floatingAddButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
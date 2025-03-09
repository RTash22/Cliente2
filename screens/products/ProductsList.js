import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');

// Productos de muestra para modo offline
const sampleProducts = [
  { id: 1, name: 'Producto Offline 1', price: 100, description: 'Descripción de producto offline 1', category: 'Electrónica', stock: 10, imageurl: null },
  { id: 2, name: 'Producto Offline 2', price: 200, description: 'Descripción de producto offline 2', category: 'Ropa', stock: 5, imageurl: null },
  { id: 3, name: 'Producto Offline 3', price: 300, description: 'Descripción de producto offline 3', category: 'Hogar', stock: 15, imageurl: null },
];

export default function ProductsList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isConnected, setIsConnected] = useState(null);
  const [currentApiUrl, setCurrentApiUrl] = useState(null);
  
  // URLs de API para intentar en orden
  const apiUrls = [
    'http://192.168.0.12:8000/api/products',
    'http://localhost:8000/api/products',
    'http://127.0.0.1:8000/api/products'
  ];

  // Intenta conectar a la siguiente URL de API disponible
  const tryNextApiUrl = async () => {
    for (const url of apiUrls) {
      try {
        console.log('Intentando conectar a:', url);
        // Timeout de 5 segundos para evitar esperas largas
        const response = await axios.get(url, { timeout: 5000 });
        console.log('Conexión exitosa a:', url);
        setCurrentApiUrl(url);
        setIsConnected(true);
        return response;
      } catch (error) {
        console.log('Error al conectar a:', url, error.message);
      }
    }
    
    // Si llegamos aquí, todas las URLs fallaron
    setIsOfflineMode(true);
    setIsConnected(false);
    console.log('Todas las conexiones fallaron, activando modo offline');
    
    // Retornar productos de muestra como fallback
    return { data: sampleProducts };
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    console.log('Iniciando la carga de productos...');
    setRefreshing(true);
    try {
      const response = await tryNextApiUrl();
      if (response && response.data) {
        console.log('Productos obtenidos:', response.data);
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los productos. ' + error.message);
    } finally {
      setRefreshing(false);
      console.log('Finalizó la carga de productos.');
    }
  };

  const testConnection = async () => {
    setRefreshing(true);
    try {
      const response = await tryNextApiUrl();
      if (response) {
        Alert.alert(
          isConnected ? 'Conexión Exitosa' : 'Modo Offline Activo',
          isConnected 
            ? `Conectado a: ${currentApiUrl}` 
            : 'No se pudo conectar a ninguna API. Usando datos offline.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Prueba de conexión fallida: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    if (!isOfflineMode) {
      setProducts(sampleProducts);
      Alert.alert('Modo Offline Activado', 'Usando datos de muestra');
    } else {
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (isOfflineMode) {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      Alert.alert("Eliminado (Offline)", "Producto eliminado en modo offline.");
      return;
    }

    if (!currentApiUrl) {
      Alert.alert("Error", "No hay una URL de API configurada.");
      return;
    }

    try {
      await axios.delete(`${currentApiUrl}/${id}`);
      // Actualizar la lista después de eliminar
      fetchProducts();
      Alert.alert("Eliminado", "Producto eliminado exitosamente.");
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
            <Text style={styles.buttonTextSmall}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Confirmar eliminación",
                "¿Estás seguro de que deseas eliminar este producto?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", style: "destructive", onPress: () => deleteProduct(item.id) }
                ]
              );
            }}
          >
            <Text style={styles.buttonTextSmall}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Lista de Productos
        {isOfflineMode && ' (Offline)'}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testConnection}
        >
          <Text style={styles.buttonText}>Probar Conexión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            isOfflineMode ? styles.onlineButton : styles.offlineButton
          ]} 
          onPress={toggleOfflineMode}
        >
          <Text style={styles.buttonText}>
            {isOfflineMode ? 'Modo Online' : 'Modo Offline'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isConnected === false && !isOfflineMode && (
        <Text style={styles.offlineMessage}>
          Sin conexión a la API. Active el modo offline o revise la conexión.
        </Text>
      )}
      
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchProducts}
        refreshing={refreshing}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isOfflineMode 
              ? 'No hay productos offline disponibles.' 
              : 'No hay productos disponibles o no se pudo conectar al servidor.'}
          </Text>
        }
      />
      
      <View style={styles.floatingButtonContainer}>
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
    color: '#2ecc71',
    marginBottom: 5,
  },
  itemStock: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailButton: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 5,
  },
  buttonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingAddButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  testButton: {
    backgroundColor: '#3498db',
  },
  offlineButton: {
    backgroundColor: '#e67e22',
  },
  onlineButton: {
    backgroundColor: '#2ecc71',
  },
  offlineTag: {
    color: 'white',
    backgroundColor: '#e74c3c',
    padding: 3,
    borderRadius: 3,
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  offlineMessage: {
    textAlign: 'center',
    color: '#e74c3c',
    marginBottom: 10,
    fontSize: 14,
  }
});

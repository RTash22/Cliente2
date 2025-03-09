import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');

// Ventas de muestra para modo offline
const sampleSales = [
  { id: 1, date: '2025-03-08T14:30:00', customer: 'Cliente Offline 1', total: 350, products: [
    { productId: 1, name: 'Producto Offline 1', price: 100, quantity: 2 },
    { productId: 2, name: 'Producto Offline 2', price: 150, quantity: 1 }
  ], status: 'completada' },
  { id: 2, date: '2025-03-08T12:15:00', customer: 'Cliente Offline 2', total: 600, products: [
    { productId: 3, name: 'Producto Offline 3', price: 300, quantity: 2 }
  ], status: 'pendiente' },
  { id: 3, date: '2025-03-07T09:45:00', customer: 'Cliente Offline 3', total: 450, products: [
    { productId: 1, name: 'Producto Offline 1', price: 100, quantity: 1 },
    { productId: 2, name: 'Producto Offline 2', price: 150, quantity: 1 },
    { productId: 3, name: 'Producto Offline 3', price: 200, quantity: 1 }
  ], status: 'completada' }
];

export default function SalesList({ navigation }) {
  const [sales, setSales] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isConnected, setIsConnected] = useState(null);
  const [currentApiUrl, setCurrentApiUrl] = useState(null);
  
  // URLs de API para intentar en orden
  const apiUrls = [
    'http://192.168.0.12:8000/api/sales',
    'http://localhost:8000/api/sales',
    'http://127.0.0.1:8000/api/sales'
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
    
    // Retornar ventas de muestra como fallback
    return { data: sampleSales };
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    fetchSales();
  }, []);

  const fetchSales = async () => {
    console.log('Iniciando la carga de ventas...');
    setRefreshing(true);
    try {
      const response = await tryNextApiUrl();
      if (response && response.data) {
        console.log('Ventas obtenidas:', response.data);
        setSales(response.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las ventas. ' + error.message);
    } finally {
      setRefreshing(false);
      console.log('Finalizó la carga de ventas.');
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
      setSales(sampleSales);
      Alert.alert('Modo Offline Activado', 'Usando datos de muestra');
    } else {
      fetchSales();
    }
  };

  const deleteSale = async (id) => {
    if (isOfflineMode) {
      const updatedSales = sales.filter(sale => sale.id !== id);
      setSales(updatedSales);
      Alert.alert("Eliminada (Offline)", "Venta eliminada en modo offline.");
      return;
    }

    if (!currentApiUrl) {
      Alert.alert("Error", "No hay una URL de API configurada.");
      return;
    }

    try {
      await axios.delete(`${currentApiUrl}/${id}`);
      // Actualizar la lista después de eliminar
      fetchSales();
      Alert.alert("Eliminada", "Venta eliminada exitosamente.");
    } catch (error) {
      console.error(`Error al eliminar la venta: ${error.message}`);
      Alert.alert(
        "Error",
        "No se pudo eliminar la venta. " + error.message,
        [{ text: "OK" }]
      );
    }
  };

  // Prerenderizamos las animaciones fuera de renderItem para cumplir con las reglas de hooks
  const slideAnimations = sales.map((_, index) => {
    const anim = new Animated.Value(width);
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      delay: index * 100,
      useNativeDriver: false,
    }).start();
    return anim;
  });

  // Formato de fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          <View style={styles.headerRow}>
            <Text style={styles.itemCustomer}>{item.customer}</Text>
            <Text style={[styles.statusTag, 
              item.status === 'completada' ? styles.completedStatus : styles.pendingStatus]}>
              {item.status === 'completada' ? 'Completada' : 'Pendiente'}
            </Text>
          </View>
          <Text style={styles.itemDate}>Fecha: {formatDate(item.date)}</Text>
          <Text style={styles.itemTotal}>Total: ${item.total}</Text>
          <Text style={styles.itemProducts}>Productos: {item.products.length}</Text>
          {isOfflineMode && <Text style={styles.offlineTag}>Offline</Text>}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('SaleDetail', { sale: item })}
          >
            <Text style={styles.buttonTextSmall}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Confirmar eliminación",
                "¿Estás seguro de que deseas eliminar esta venta?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Eliminar", style: "destructive", onPress: () => deleteSale(item.id) }
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>
        Registro de Ventas
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
        data={sales}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchSales}
        refreshing={refreshing}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isOfflineMode 
              ? 'No hay ventas offline disponibles.' 
              : 'No hay ventas disponibles o no se pudo conectar al servidor.'}
          </Text>
        }
      />
      
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddSale')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </Animated.View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemCustomer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  completedStatus: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  pendingStatus: {
    backgroundColor: '#f39c12',
    color: 'white',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemTotal: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemProducts: {
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
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
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
});

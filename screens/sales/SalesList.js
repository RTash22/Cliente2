import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import axios from 'axios';

const API_URLS = [
  'http://192.168.0.12:8000/api/sales',
  'http://localhost:8000/api/sales',
  'http://127.0.0.1:8000/api/sales'
];

export default function SalesList({ navigation }) {
  const [sales, setSales] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(API_URLS[0]);

  useEffect(() => {
    fetchSales();
  }, []);

  const tryNextApiUrl = async (currentIndex = 0) => {
    if (currentIndex >= API_URLS.length) {
      console.log('No se pudo conectar a ninguna API. Activando modo offline.');
      setIsOfflineMode(true);
      return false;
    }

    const url = API_URLS[currentIndex];
    console.log('Intentando conectar a:', url);
    
    try {
      const response = await axios.get(url);
      console.log('Conexión exitosa a:', url);
      setCurrentApiUrl(url);
      return response;
    } catch (error) {
      console.log('Error conectando a:', url, error.message);
      return tryNextApiUrl(currentIndex + 1);
    }
  };

  const fetchSales = async () => {
    console.log('Iniciando la carga de ventas...');
    setRefreshing(true);
    try {
      const response = await tryNextApiUrl();
      if (response && response.data) {
        console.log('=== DATOS DE VENTAS ===');
        console.log('Primera venta:', JSON.stringify(response.data[0], null, 2));
        console.log(JSON.stringify(response.data, null, 2));
        setSales(response.data);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
      }
      Alert.alert('Error', 'No se pudieron cargar las ventas. ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.saleItem}
      onPress={() => navigation.navigate('SaleDetail', { sale: item })}
    >
      <View style={styles.saleHeader}>
        <Text style={styles.saleId}>Venta #{item.id}</Text>
        <Text style={styles.saleDate}>
          {new Date(item.created_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>
          👤 {item.customer_name || 'Cliente no especificado'}
        </Text>
      </View>

      <View style={styles.productsContainer}>
        {item.product && (
          <View style={styles.productItem}>
            <Text style={styles.productName}>
              {item.quantity}x {item.product.name}
            </Text>
            <Text style={styles.productPrice}>
              ${(item.unit_price * item.quantity).toFixed(2)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.saleFooter}>
        <Text style={[
          styles.status,
          { color: item.status === 'completed' ? '#27ae60' : 
                   item.status === 'pending' ? '#f39c12' : '#e74c3c' }
        ]}>
          {item.status === 'completed' ? '✓ Completada' :
           item.status === 'pending' ? '⏳ Pendiente' : '✕ Cancelada'}
        </Text>
        <Text style={styles.totalAmount}>Total: ${item.total_amount || '0'}</Text>
      </View>

      <Text style={styles.paymentMethod}>
        {item.payment_method === 'cash' ? '💵 Efectivo' :
         item.payment_method === 'card' ? '💳 Tarjeta' : '🏦 Transferencia'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchSales}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay ventas registradas</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSale')}
      >
        <Text style={styles.addButtonText}>+ Nueva Venta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  saleItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 10,
  },
  saleId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saleDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  customerInfo: {
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
  },
  productsContainer: {
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  productName: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 15,
    color: '#27ae60',
    fontWeight: '600',
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'right',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

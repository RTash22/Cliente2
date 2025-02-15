import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function ProductsList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [testResult, setTestResult] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('http://192.168.0.17:8000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get('http://192.168.0.17:8000/api/products');
      if (response.status === 200) {
        setTestResult('Conexión exitosa a la API');
      } else {
        setTestResult('Error en la conexión a la API');
      }
    } catch (error) {
      setTestResult(`Error en la conexión: ${error.message}`);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://192.168.0.17:8000/api/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error(`Error al eliminar el producto: ${error.message}`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Productos</Text>
      {testResult !== '' && <Text style={styles.testResult}>{testResult}</Text>}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onRefresh={fetchProducts}
        refreshing={refreshing}
      />
      <View style={styles.floatingButton}>
        <TouchableOpacity style={styles.smallButton} onPress={testConnection}>
          <Text style={styles.buttonText}>Probar conexión</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.floatingAddButton}>
        <TouchableOpacity
          style={styles.smallButton}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  testResult: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: 'green',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  smallButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
});
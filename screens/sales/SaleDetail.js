import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList } from 'react-native';

export default function SaleDetail({ route, navigation }) {
  const { sale } = route.params;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isOfflineSale] = useState(!sale.id || sale.id <= 3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  }, []);

  // Formato de fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Renderiza un elemento de la lista de productos
  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Precio: ${item.price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>x{item.quantity}</Text>
        <Text style={styles.subtotal}>${item.price * item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Animated.View 
        style={[
          styles.card, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.saleName}>Venta #{sale.id}</Text>
          {isOfflineSale && (
            <Text style={styles.offlineTag}>(Venta Offline)</Text>
          )}
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cliente:</Text>
            <Text style={styles.detailValue}>{sale.customer}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{formatDate(sale.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusBadge, 
                sale.status === 'completada' ? styles.completedStatus : styles.pendingStatus
              ]}>
                {sale.status === 'completada' ? 'Completada' : 'Pendiente'}
              </Text>
            </View>
          </View>
          
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <FlatList
              data={sale.products}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => `${item.productId || index}`}
              scrollEnabled={false}
            />
          </View>
          
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos:</Text>
              <Text style={styles.summaryValue}>{sale.products.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cantidad Total:</Text>
              <Text style={styles.summaryValue}>
                {sale.products.reduce((sum, product) => sum + product.quantity, 0)} unidades
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${sale.total}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    padding: 15,
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  offlineTag: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  detailsContainer: {
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  completedStatus: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  pendingStatus: {
    backgroundColor: '#f39c12',
    color: 'white',
  },
  productsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productDetails: {
    flex: 3,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtotal: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '500',
  },
  summarySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  backButton: {
    margin: 15,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

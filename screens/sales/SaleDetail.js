import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function SaleDetail({ route, navigation }) {
  const { sale } = route.params || {};

  if (!sale) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontraron detalles de la venta</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Traducir estados del inglés al español
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  // Traducir métodos de pago
  const translatePaymentMethod = (method) => {
    const methodMap = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return methodMap[method] || method;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  // Obtener la lista de productos
  const getProducts = () => {
    if (sale.sale_products && sale.sale_products.length > 0) {
      return sale.sale_products;
    } else if (sale.additional_products) {
      // Si hay un producto principal y productos adicionales
      const mainProduct = {
        product_id: sale.product_id,
        quantity: sale.quantity,
        price: sale.price
      };
      return [mainProduct, ...sale.additional_products];
    } else if (sale.products) {
      // Formato antiguo/offline
      return sale.products;
    }
    return [];
  };

  const products = getProducts();
  const total = sale.total || products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.saleName}>Venta #{sale.id || 'Nueva'}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cliente:</Text>
            <Text style={styles.detailValue}>{sale.customer || 'Sin nombre'}</Text>
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
                sale.status === 'completed' ? styles.completedStatus : styles.pendingStatus
              ]}>
                {translateStatus(sale.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Método de Pago:</Text>
            <Text style={styles.detailValue}>{translatePaymentMethod(sale.payment_method)}</Text>
          </View>
          
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name || `Producto #${product.product_id}`}</Text>
                  <Text style={styles.productPrice}>Precio: ${product.price}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantity}>x{product.quantity}</Text>
                  <Text style={styles.subtotal}>${product.quantity * product.price}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos:</Text>
              <Text style={styles.summaryValue}>{products.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cantidad Total:</Text>
              <Text style={styles.summaryValue}>
                {products.reduce((sum, product) => sum + product.quantity, 0)} unidades
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${total}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
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
    color: '#2c3e50',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  subtotal: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginTop: 4,
  },
  summarySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

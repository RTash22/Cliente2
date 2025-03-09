import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function SaleDetail({ route }) {
  const { sale } = route.params;
  
  console.log('=== DATOS DE LA VENTA EN DETALLE ===');
  console.log(JSON.stringify(sale, null, 2));

  if (!sale) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontraron datos de la venta</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'pending': return '⏳';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'transfer': return '🏦';
      default: return '💰';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const translatePaymentMethod = (method) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.saleId}>Venta #{sale.id}</Text>
        <Text style={styles.date}>{formatDate(sale.created_at)}</Text>
      </View>

      {/* Estado y Método de Pago */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Estado</Text>
          <Text style={[styles.infoValue, { color: getStatusColor(sale.status) }]}>
            {getStatusIcon(sale.status)} {translateStatus(sale.status)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Método de Pago</Text>
          <Text style={styles.infoValue}>
            {getPaymentIcon(sale.payment_method)} {translatePaymentMethod(sale.payment_method)}
          </Text>
        </View>
      </View>

      {/* Producto */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Producto</Text>
        <View style={styles.productItem}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{sale.product.name}</Text>
            <Text style={styles.productDescription}>{sale.product.description}</Text>
            <Text style={styles.productCategory}>Categoría: {sale.product.category}</Text>
          </View>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantity}>x{sale.quantity}</Text>
            <Text style={styles.price}>Precio: ${sale.unit_price}</Text>
            <Text style={styles.subtotal}>
              Total: ${sale.total_amount}
            </Text>
          </View>
        </View>
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Final</Text>
        <Text style={styles.totalAmount}>${sale.total_amount}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saleId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  productsContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#3498db',
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  totalContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});

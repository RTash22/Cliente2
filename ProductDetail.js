import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function ProductDetail({ route }) {
  const { product } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Producto</Text>
      <Text style={styles.detail}>ID: {product.id}</Text>
      <Text style={styles.detail}>Nombre: {product.name}</Text>
      <Text style={styles.detail}>Precio: {product.price}</Text>
      <Text style={styles.detail}>Descripcion: {product.description}</Text>
      <Text style={styles.detail}>Categoria: {product.category}</Text>
      <Text style={styles.detail}>Stock: {product.stock}</Text>
      <Text style={styles.detail}>Imagen:</Text>
      <Image source={{ uri: product.imageurl }} style={styles.image} />
      {/* Agrega aquí más campos del producto si es necesario */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});
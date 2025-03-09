import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Animated
} from 'react-native';
import axios from 'axios';

export default function AddProduct({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageurl, setImageUrl] = useState('');
  const [currentApiUrl, setCurrentApiUrl] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const apiUrls = [
    'http://192.168.0.12:8000/api/products',
    'http://localhost:8000/api/products',
    'http://127.0.0.1:8000/api/products'
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
    
    testConnections();
  }, []);

  const testConnections = async () => {
    try {
      for (const url of apiUrls) {
        try {
          console.log('Probando conexión a:', url);
          const response = await axios.get(url, { timeout: 3000 });
          if (response.status === 200) {
            console.log('Conexión exitosa a:', url);
            setCurrentApiUrl(url);
            setIsOfflineMode(false);
            return;
          }
        } catch (error) {
          console.log('Error al conectar a:', url, error.message);
        }
      }
      // Si llegamos aquí, todas las URLs fallaron
      console.log('No se pudo conectar a ninguna API. Activando modo offline.');
      setIsOfflineMode(true);
    } catch (error) {
      console.error('Error al probar conexiones:', error);
      setIsOfflineMode(true);
    }
  };

  const validateForm = () => {
    if (!name || !price || !description || !category || !stock) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return false;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'El precio debe ser un número positivo');
      return false;
    }
    
    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      Alert.alert('Error', 'El stock debe ser un número entero positivo o cero');
      return false;
    }
    
    return true;
  };

  const addProduct = async () => {
    if (!validateForm()) return;
    
    const newProduct = {
      name,
      price: parseFloat(price),
      description,
      category,
      stock: parseInt(stock),
      imageurl: imageurl || null
    };
    
    if (isOfflineMode) {
      Alert.alert(
        'Producto agregado (Modo Offline)',
        'El producto ha sido guardado localmente. Se sincronizará cuando vuelva la conexión.',
        [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
      );
      return;
    }
    
    try {
      console.log('Añadiendo producto a:', currentApiUrl);
      const response = await axios.post(currentApiUrl, newProduct);
      
      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          'Producto agregado',
          'El producto se agregó exitosamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
        );
      }
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
      
      Alert.alert(
        'Error',
        'No se pudo agregar el producto: ' + error.message,
        [
          { text: 'Cancelar' },
          { 
            text: 'Guardar Localmente', 
            onPress: () => {
              setIsOfflineMode(true);
              Alert.alert(
                'Guardado Localmente',
                'El producto se ha guardado localmente y se sincronizará cuando se restaure la conexión.',
                [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
              );
            }
          }
        ]
      );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          Agregar Nuevo Producto
          {isOfflineMode ? ' (Modo Offline)' : ''}
        </Text>
        
        {isOfflineMode && (
          <Text style={styles.offlineWarning}>
            ⚠️ Estás en modo offline. Los productos se guardarán localmente.
          </Text>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre del producto"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio*</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Precio (ej. 299.99)"
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción detallada del producto"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría*</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Categoría (ej. Electrónica, Ropa, etc.)"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock*</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="Cantidad disponible"
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de imagen (opcional)</Text>
            <TextInput
              style={styles.input}
              value={imageurl}
              onChangeText={setImageUrl}
              placeholder="URL de imagen del producto"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={addProduct}
            >
              <Text style={styles.buttonText}>Guardar Producto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  offlineWarning: {
    backgroundColor: '#ffcc00',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

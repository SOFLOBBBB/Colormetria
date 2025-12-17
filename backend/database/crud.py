"""
Operaciones CRUD
================
Operaciones de Crear, Leer, Actualizar y Eliminar para la base de datos.
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
from datetime import datetime

from .modelos import Usuario, Analisis, Recomendacion


class CRUDUsuario:
    """Operaciones CRUD para usuarios"""
    
    @staticmethod
    def crear(db: Session, nombre: str, email: str, genero: str) -> Usuario:
        """
        Crea un nuevo usuario en la base de datos.
        
        Args:
            db: Sesión de base de datos
            nombre: Nombre del usuario
            email: Email del usuario
            genero: Género del usuario
            
        Returns:
            Usuario creado
        """
        usuario = Usuario(
            nombre=nombre,
            email=email,
            genero=genero
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return usuario
    
    @staticmethod
    def obtener_por_id(db: Session, usuario_id: int) -> Optional[Usuario]:
        """Obtiene un usuario por su ID"""
        return db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    @staticmethod
    def obtener_por_email(db: Session, email: str) -> Optional[Usuario]:
        """Obtiene un usuario por su email"""
        return db.query(Usuario).filter(Usuario.email == email).first()
    
    @staticmethod
    def obtener_todos(db: Session, skip: int = 0, limit: int = 100) -> List[Usuario]:
        """Obtiene todos los usuarios con paginación"""
        return db.query(Usuario).offset(skip).limit(limit).all()
    
    @staticmethod
    def actualizar(db: Session, usuario_id: int, datos: Dict[str, Any]) -> Optional[Usuario]:
        """Actualiza un usuario existente"""
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if usuario:
            for campo, valor in datos.items():
                if hasattr(usuario, campo):
                    setattr(usuario, campo, valor)
            db.commit()
            db.refresh(usuario)
        return usuario
    
    @staticmethod
    def eliminar(db: Session, usuario_id: int) -> bool:
        """Elimina un usuario"""
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if usuario:
            db.delete(usuario)
            db.commit()
            return True
        return False


class CRUDAnalisis:
    """Operaciones CRUD para análisis"""
    
    @staticmethod
    def crear(
        db: Session,
        estacion: str,
        subtono: str,
        contraste: str,
        forma_rostro: str,
        color_piel_hex: str,
        color_piel_nombre: str,
        color_ojos_hex: str,
        color_ojos_nombre: str,
        color_cabello_hex: str,
        color_cabello_nombre: str,
        confianza: float,
        genero: str,
        usuario_id: Optional[int] = None,
        imagen_path: Optional[str] = None
    ) -> Analisis:
        """
        Crea un nuevo análisis en la base de datos.
        
        Returns:
            Análisis creado
        """
        analisis = Analisis(
            usuario_id=usuario_id,
            estacion=estacion,
            subtono=subtono,
            contraste=contraste,
            forma_rostro=forma_rostro,
            color_piel_hex=color_piel_hex,
            color_piel_nombre=color_piel_nombre,
            color_ojos_hex=color_ojos_hex,
            color_ojos_nombre=color_ojos_nombre,
            color_cabello_hex=color_cabello_hex,
            color_cabello_nombre=color_cabello_nombre,
            confianza=confianza,
            genero=genero,
            imagen_path=imagen_path
        )
        db.add(analisis)
        db.commit()
        db.refresh(analisis)
        return analisis
    
    @staticmethod
    def obtener_por_id(db: Session, analisis_id: int) -> Optional[Analisis]:
        """Obtiene un análisis por su ID"""
        return db.query(Analisis).filter(Analisis.id == analisis_id).first()
    
    @staticmethod
    def obtener_por_usuario(db: Session, usuario_id: int) -> List[Analisis]:
        """Obtiene todos los análisis de un usuario"""
        return db.query(Analisis).filter(Analisis.usuario_id == usuario_id).order_by(Analisis.fecha.desc()).all()
    
    @staticmethod
    def obtener_todos(db: Session, skip: int = 0, limit: int = 100) -> List[Analisis]:
        """Obtiene todos los análisis con paginación"""
        return db.query(Analisis).order_by(Analisis.fecha.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def obtener_por_estacion(db: Session, estacion: str) -> List[Analisis]:
        """Obtiene análisis filtrados por estación"""
        return db.query(Analisis).filter(Analisis.estacion == estacion).all()
    
    @staticmethod
    def obtener_estadisticas(db: Session) -> Dict[str, Any]:
        """Obtiene estadísticas de los análisis"""
        total = db.query(Analisis).count()
        
        # Contar por estación
        estaciones = {}
        for estacion in ['primavera', 'verano', 'otono', 'invierno']:
            estaciones[estacion] = db.query(Analisis).filter(Analisis.estacion == estacion).count()
        
        # Contar por género
        generos = {
            'femenino': db.query(Analisis).filter(Analisis.genero == 'femenino').count(),
            'masculino': db.query(Analisis).filter(Analisis.genero == 'masculino').count()
        }
        
        return {
            "total_analisis": total,
            "por_estacion": estaciones,
            "por_genero": generos
        }
    
    @staticmethod
    def eliminar(db: Session, analisis_id: int) -> bool:
        """Elimina un análisis"""
        analisis = db.query(Analisis).filter(Analisis.id == analisis_id).first()
        if analisis:
            db.delete(analisis)
            db.commit()
            return True
        return False


class CRUDRecomendacion:
    """Operaciones CRUD para recomendaciones"""
    
    @staticmethod
    def crear(
        db: Session,
        analisis_id: int,
        tipo: str,
        contenido: Dict[str, Any]
    ) -> Recomendacion:
        """
        Crea una nueva recomendación.
        
        Args:
            db: Sesión de base de datos
            analisis_id: ID del análisis asociado
            tipo: Tipo de recomendación (paleta, ropa, cabello, maquillaje)
            contenido: Diccionario con el contenido de la recomendación
            
        Returns:
            Recomendación creada
        """
        recomendacion = Recomendacion(
            analisis_id=analisis_id,
            tipo=tipo,
            contenido=json.dumps(contenido, ensure_ascii=False)
        )
        db.add(recomendacion)
        db.commit()
        db.refresh(recomendacion)
        return recomendacion
    
    @staticmethod
    def obtener_por_analisis(db: Session, analisis_id: int) -> List[Recomendacion]:
        """Obtiene todas las recomendaciones de un análisis"""
        return db.query(Recomendacion).filter(Recomendacion.analisis_id == analisis_id).all()
    
    @staticmethod
    def obtener_por_tipo(db: Session, analisis_id: int, tipo: str) -> Optional[Recomendacion]:
        """Obtiene una recomendación específica por tipo"""
        return db.query(Recomendacion).filter(
            Recomendacion.analisis_id == analisis_id,
            Recomendacion.tipo == tipo
        ).first()
    
    @staticmethod
    def eliminar_por_analisis(db: Session, analisis_id: int) -> int:
        """Elimina todas las recomendaciones de un análisis"""
        cantidad = db.query(Recomendacion).filter(Recomendacion.analisis_id == analisis_id).delete()
        db.commit()
        return cantidad


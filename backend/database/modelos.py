"""Modelos SQLAlchemy: Usuario, Análisis, Recomendación."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .conexion import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True)
    genero = Column(String(20), nullable=False)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    analisis = relationship("Analisis", back_populates="usuario", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "genero": self.genero,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None
        }


class Analisis(Base):
    __tablename__ = "analisis"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    
    # Resultados del análisis
    estacion = Column(String(20), nullable=False)
    subtono = Column(String(20), nullable=False)
    contraste = Column(String(20), nullable=False)
    forma_rostro = Column(String(20), nullable=False)
    color_piel_hex = Column(String(7), nullable=False)
    color_piel_nombre = Column(String(50))
    color_ojos_hex = Column(String(7), nullable=False)
    color_ojos_nombre = Column(String(50))
    color_cabello_hex = Column(String(7), nullable=False)
    color_cabello_nombre = Column(String(50))
    imagen_path = Column(String(255), nullable=True)
    confianza = Column(Float, nullable=False)
    genero = Column(String(20), nullable=False)
    usuario = relationship("Usuario", back_populates="analisis")
    recomendaciones = relationship("Recomendacion", back_populates="analisis", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "estacion": self.estacion,
            "subtono": self.subtono,
            "contraste": self.contraste,
            "forma_rostro": self.forma_rostro,
            "colores_detectados": {
                "piel": {"hex": self.color_piel_hex, "nombre": self.color_piel_nombre},
                "ojos": {"hex": self.color_ojos_hex, "nombre": self.color_ojos_nombre},
                "cabello": {"hex": self.color_cabello_hex, "nombre": self.color_cabello_nombre}
            },
            "confianza": self.confianza,
            "genero": self.genero
        }


class Recomendacion(Base):
    __tablename__ = "recomendaciones"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    analisis = relationship("Analisis", back_populates="recomendaciones")

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "analisis_id": self.analisis_id,
            "tipo": self.tipo,
            "contenido": json.loads(self.contenido) if self.contenido else {},
            "fecha": self.fecha.isoformat() if self.fecha else None
        }


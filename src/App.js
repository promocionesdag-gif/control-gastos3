import React, { useState, useEffect } from "react";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    fecha: "",
    gasto: "",
    descripcion: "",
    tipo: "",
    categoria: ""
  });

  const tipoOptions = ["Personal", "Belyou", "Sherman Morgan", "Men Shop"];

  const categoriasEmprendimiento = [
    "insumos",
    "publicidad",
    "mantenimiento",
    "pagos_producto",
    "envios",
    "otro"
  ];

  const categoriasPersonal = [
    "gastos_fijos",
    "comida",
    "transporte",
    "gustos",
    "salud",
    "ahorro",
    "viajes"
  ];

  // cargar datos al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  // guardar cuando cambien
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const getCategorias = () => {
    if (!formData.tipo) return [];
    return formData.tipo === "Personal"
      ? categoriasPersonal
      : categoriasEmprendimiento;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoria: name === "tipo" ? "" : prev.categoria
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fecha || !formData.gasto || !formData.tipo || !formData.categoria) {
      alert("Por favor completa todos los campos");
      return;
    }

    setExpenses(prev => [...prev, { ...formData, id: Date.now() }]);

    setFormData({
      fecha: "",
      gasto: "",
      descripcion: "",
      tipo: "",
      categoria: ""
    });
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ⭐ Total por tipo
  const getTotalByType = (type) => {
    return expenses
      .filter(e => e.tipo === type)
      .reduce((sum, e) => sum + parseFloat(e.gasto || 0), 0)
      .toFixed(2);
  };

  // ⭐ Total mensual por tipo
  const getMonthlyTotalByType = (type) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return expenses
      .filter(e => e.tipo === type)
      .filter(e => {
        const d = new Date(e.fecha);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + parseFloat(e.gasto || 0), 0)
      .toFixed(2);
  };

  // ⭐ Exportar a CSV
  const exportToCSV = () => {
    const headers = ["Fecha", "Descripción", "Tipo", "Categoría", "Monto"];

    const rows = expenses.map(e => [
      e.fecha,
      e.descripcion || "",
      e.tipo,
      e.categoria,
      e.gasto
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(r => csv += r.join(",") + "\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gastos.csv";
    a.click();
  };

  return (
    <div style={{
      padding: 20,
      maxWidth: 950,
      margin: "0 auto",
      fontFamily: "Arial",
      background: "#f6f6ff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center", color: "#4b3fbf" }}>
        Registro de Gastos
      </h1>

      {/* FORMULARIO */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
        marginBottom: 20
      }}>
        <h3>Agregar gasto</h3>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Fecha</label><br />
            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange}/>
          </div>

          <div>
            <label>Monto</label><br />
            <input type="number" name="gasto" value={formData.gasto} onChange={handleInputChange} step="0.01"/>
          </div>

          <div>
            <label>Descripción</label><br />
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Ej. súper, uber, insumos..."
            />
          </div>

          <div>
            <label>Tipo</label><br />
            <select name="tipo" value={formData.tipo} onChange={handleInputChange}>
              <option value="">Seleccionar</option>
              {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label>Categoría</label><br />
            <select
              name="categoria"
              value={formData.categoria || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, categoria: e.target.value }))
              }
              disabled={!formData.tipo}
            >
              <option value="">Seleccionar</option>
              {getCategorias().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <br/>

          <button type="submit" style={{ background:"#6c63ff", color:"white", padding:"8px 14px", borderRadius:8 }}>
            Agregar gasto
          </button>
        </form>
      </div>

      {/* TOTALES */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:10,
        marginBottom:20
      }}>
        {tipoOptions.map(tipo => (
          <div key={tipo} style={{
            background:"white",
            padding:10,
            borderRadius:10,
            boxShadow:"0 1px 6px rgba(0,0,0,.1)"
          }}>
            <strong>{tipo}</strong><br/>
            Total histórico: ${getTotalByType(tipo)}<br/>
            Total este mes: ${getMonthlyTotalByType(tipo)}
          </div>
        ))}
      </div>

      {/* BOTÓN EXPORTAR */}
      <button
        onClick={exportToCSV}
        style={{ background:"#00a884", color:"white", padding:"8px 14px", borderRadius:8 }}
      >
        Exportar a Excel (CSV)
      </button>

      {/* LISTA */}
      <h2>Gastos</h2>

      {expenses.length === 0 && <p>No hay gastos registrados.</p>}

      {expenses.length > 0 && (
        <ul>
          {expenses.map(e => (
            <li key={e.id}>
              {e.fecha} — <strong>{e.tipo}</strong> — {e.categoria} — {e.descripcion} — ${e.gasto}
              &nbsp;
              <button onClick={() => handleDelete(e.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
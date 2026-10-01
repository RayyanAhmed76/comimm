import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type Chart,
  type Plugin,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export function thresholdColor(pct: number) {
  if (pct >= 70) return '#22c55e'
  if (pct >= 40) return '#fb923c'
  return '#ef4444'
}

const tooltip = {
  backgroundColor: '#0A1633',
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: 'bold' as const },
  bodyFont: { size: 12 },
}

function valueLabelsPlugin(suffix = '', id = 'valueLabels'): Plugin<'bar'> {
  return {
    id,
    afterDatasetsDraw(chart: Chart<'bar'>) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      if (!meta?.data) return
      ctx.save()
      ctx.fillStyle = '#0A1633'
      ctx.font = '600 11px DM Sans, system-ui, sans-serif'
      ctx.textAlign = 'center'
      meta.data.forEach((bar, i) => {
        const raw = chart.data.datasets[0].data[i]
        const val = typeof raw === 'number' ? raw : 0
        ctx.fillText(`${val}${suffix}`, bar.x, bar.y - 8)
      })
      ctx.restore()
    },
  }
}

export function DailyExercisesChart({
  labels,
  values,
  highlightIndex = 4,
}: {
  labels: string[]
  values: number[]
  highlightIndex?: number
}) {
  return (
    <div className="h-48 sm:h-56">
      <Bar
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: values.map((_, i) =>
                i === highlightIndex ? '#fb923c' : '#0A1633',
              ),
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 48,
            },
          ],
        }}
        plugins={[valueLabelsPlugin()]}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: { legend: { display: false }, tooltip },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 12, weight: 500 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { size: 11 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}

export function ThresholdBarChart({
  title,
  labels,
  values,
}: {
  title: string
  labels: string[]
  values: number[]
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <div className="mt-3 h-40 sm:h-44">
        <Bar
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: values.map(thresholdColor),
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 36,
              },
            ],
          }}
          plugins={[valueLabelsPlugin('%', `threshold-${title}`)]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 18 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...tooltip,
                callbacks: { label: (ctx) => `${ctx.parsed.y}%` },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: '#64748b',
                  font: { size: 10 },
                  maxRotation: 0,
                  autoSkip: false,
                },
                border: { display: false },
              },
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#f1f5f9' },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 10 },
                  callback: (v) => `${v}%`,
                },
                border: { display: false },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export function CustomKpiChart({ values }: { values: number[] }) {
  return (
    <div className="h-40">
      <Bar
        data={{
          labels: values.map((_, i) => `W${i + 1}`),
          datasets: [
            {
              data: values,
              backgroundColor: '#1d5ed8',
              borderRadius: 6,
              borderSkipped: false,
              maxBarThickness: 40,
            },
          ],
        }}
        plugins={[valueLabelsPlugin('', 'customKpiLabels')]}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 18 } },
          plugins: { legend: { display: false }, tooltip },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 11 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { size: 10 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}

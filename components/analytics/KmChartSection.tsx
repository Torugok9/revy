import { FeatureGate } from "@/components/FeatureGate";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useOdometer, useOdometerHistory } from "@/hooks/useOdometer";
import { OdometerHistoryPoint } from "@/types/odometer";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

interface KmChartSectionProps {
  vehicleId: string;
}

type Period = "month" | "quarter" | "year" | "all";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "month", label: "Mês" },
  { key: "quarter", label: "Trim" },
  { key: "year", label: "Ano" },
  { key: "all", label: "Tudo" },
];

const CHART_HEIGHT = 180;
const CHART_PADDING_LEFT = 50;
const CHART_PADDING_RIGHT = 16;
const CHART_PADDING_TOP = 16;
const CHART_PADDING_BOTTOM = 28;

function formatDate(dateStr: string, period: Period): string {
  const date = new Date(dateStr + "T12:00:00");
  if (period === "month") {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return months[date.getMonth()];
}

function formatKmAxis(km: number): string {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}k`;
  }
  return km.toLocaleString("pt-BR");
}

function MiniLineChart({
  data,
  period,
  width,
}: {
  data: OdometerHistoryPoint[];
  period: Period;
  width: number;
}) {
  if (data.length < 2) {
    return (
      <View style={[chartStyles.emptyChart, { height: CHART_HEIGHT }]}>
        <Text style={chartStyles.emptyChartText}>
          Dados insuficientes para o gráfico
        </Text>
      </View>
    );
  }

  const chartWidth =
    width - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const chartHeight =
    CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const kms = data.map((d) => d.km);
  const minKm = Math.min(...kms);
  const maxKm = Math.max(...kms);
  const kmRange = maxKm - minKm || 1;

  // Build points
  const points = data.map((d, i) => {
    const x =
      CHART_PADDING_LEFT +
      (i / (data.length - 1)) * chartWidth;
    const y =
      CHART_PADDING_TOP +
      chartHeight -
      ((d.km - minKm) / kmRange) * chartHeight;
    return { x, y, source: d.source, date: d.date };
  });

  const polylinePoints = points
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Y axis labels (3 ticks)
  const yTicks = [minKm, minKm + kmRange / 2, maxKm];

  // X axis labels (max 5)
  const step = Math.max(1, Math.floor(data.length / 4));
  const xLabels: { x: number; label: string }[] = [];
  for (let i = 0; i < data.length; i += step) {
    xLabels.push({
      x: points[i].x,
      label: formatDate(data[i].date, period),
    });
  }
  // Always include last
  if (xLabels.length > 0 && xLabels[xLabels.length - 1].x !== points[points.length - 1].x) {
    xLabels.push({
      x: points[points.length - 1].x,
      label: formatDate(data[data.length - 1].date, period),
    });
  }

  return (
    <View style={{ height: CHART_HEIGHT }}>
      <Svg width={width} height={CHART_HEIGHT}>
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y =
            CHART_PADDING_TOP +
            chartHeight -
            ((tick - minKm) / kmRange) * chartHeight;
          return (
            <Line
              key={`grid-${i}`}
              x1={CHART_PADDING_LEFT}
              y1={y}
              x2={width - CHART_PADDING_RIGHT}
              y2={y}
              stroke="#333333"
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={Colors.dark.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.source === "maintenance" ? 4 : 3}
            fill={
              p.source === "maintenance" ? "#3B82F6" : Colors.dark.primary
            }
            stroke={Colors.dark.surface}
            strokeWidth={1.5}
          />
        ))}
      </Svg>

      {/* Y axis labels */}
      {yTicks.map((tick, i) => {
        const y =
          CHART_PADDING_TOP +
          chartHeight -
          ((tick - minKm) / kmRange) * chartHeight;
        return (
          <Text
            key={`ylabel-${i}`}
            style={[
              chartStyles.yLabel,
              { top: y - 7, left: 4 },
            ]}
          >
            {formatKmAxis(tick)}
          </Text>
        );
      })}

      {/* X axis labels */}
      {xLabels.map((item, i) => (
        <Text
          key={`xlabel-${i}`}
          style={[
            chartStyles.xLabel,
            {
              left: item.x - 15,
              bottom: 2,
            },
          ]}
        >
          {item.label}
        </Text>
      ))}
    </View>
  );
}

function KmChartContent({ vehicleId }: { vehicleId: string }) {
  const [period, setPeriod] = useState<Period>("year");
  const [chartWidth, setChartWidth] = useState(0);
  const { history, loading: historyLoading } = useOdometerHistory(
    vehicleId,
    period,
  );
  const { stats } = useOdometer(vehicleId);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setChartWidth(e.nativeEvent.layout.width);
    },
    [],
  );

  const hasData = history?.data && history.data.length > 0;
  const loading = historyLoading;

  return (
    <View style={styles.contentCard} onLayout={onLayout}>
      {/* Period filters */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setPeriod(opt.key)}
            style={[
              styles.periodChip,
              period === opt.key && styles.periodChipActive,
            ]}
          >
            <Text
              style={[
                styles.periodChipText,
                period === opt.key && styles.periodChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      {loading ? (
        <View style={styles.chartLoading}>
          <ActivityIndicator color={Colors.dark.primary} />
        </View>
      ) : !hasData ? (
        <View style={styles.emptyChart}>
          <Ionicons
            name="analytics-outline"
            size={28}
            color={Colors.dark.textMuted}
          />
          <Text style={styles.emptyText}>
            Registre quilometragem para ver o gráfico de evolução
          </Text>
        </View>
      ) : (
        chartWidth > 0 && (
          <MiniLineChart
            data={history!.data}
            period={period}
            width={chartWidth - Spacing.xl * 2}
          />
        )
      )}

      {/* Mini stats */}
      {stats?.has_data && (
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatValue}>
              {stats.km_per_day.toFixed(1).replace(".", ",")}
            </Text>
            <Text style={styles.miniStatLabel}>km/dia</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniStatValue}>
              {stats.projected_annual_km.toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.miniStatLabel}>km/ano (projeção)</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function KmChartSection({ vehicleId }: KmChartSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quilometragem</Text>
      <FeatureGate feature="km_charts" mode="card">
        <KmChartContent vehicleId={vehicleId} />
      </FeatureGate>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  emptyChart: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textMuted,
  },
  yLabel: {
    position: "absolute",
    fontFamily: Fonts.family.regular,
    fontSize: 10,
    color: Colors.dark.textMuted,
  },
  xLabel: {
    position: "absolute",
    fontFamily: Fonts.family.regular,
    fontSize: 10,
    color: Colors.dark.textMuted,
    width: 30,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  contentCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.dark.borderStrong,
  },
  periodRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  periodChipActive: {
    backgroundColor: Colors.dark.primary,
  },
  periodChipText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  periodChipTextActive: {
    color: "#FFFFFF",
  },
  chartLoading: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  miniStatsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  miniStatValue: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  miniStatLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});

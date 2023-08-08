/// <reference types="react" />
declare module "sharedComponents/pages/app-endpoint/connect" {
    export function AppEndpointsManagementConnectPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/monitoring" {
    export function AppEndpointsManagementMonitoringPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/security/app-roles" {
    export function AppEndpointAppRolesPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/security/app-users" {
    export function AppEndpointAppUsersPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/security/auth-providers" {
    export function AppEndpointAuthProvidersPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/security" {
    export function AppEndpointsManagementSecurityPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-endpoint/settings" {
    export function AppEndpointsManagementSettingsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-service/app-endpoints" {
    export function AppEndpointsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-service/monitoring-page" {
    export function MonitoringPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/app-service/settings" {
    export function SettingsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/backup" {
    export function BackupPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/connect" {
    export function ConnectPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/data-tools" {
    export function DataToolsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/list" {
    export function DatabaseList(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/monitoring" {
    export function DatabaseMonitoringPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/settings" {
    export function SettingsDatabasePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/database/tools" {
    export function Query(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/not-found" {
    export function NotFoundPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization/access-management" {
    export function TeamsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization/billing" {
    export function BillingPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization/project-list" {
    export function ProjectListPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization/support-create" {
    export function SupportCreatePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization/support-list" {
    export function SupportListPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization-settings/billing" {
    export function UsagePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization-settings/general-page" {
    export function GeneralPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization-settings/security" {
    export function SsoPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/organization-settings/security/mfa" {
    export function MfaPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/project/app-service/app-service-create" {
    export function AppServiceCreatePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/project/app-service/app-service-create" {
    export function AppServicesPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/project/collaborators" {
    export function CollaboratorsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/project/database" {
    export function DatabasePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/project/settings" {
    export function SettingsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/projects" {
    export function ProjectsPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/quick-start" {
    export function QuickStart(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/settings/api-keys" {
    export function ApiKeyPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/settings/api-keys/create" {
    export function ApiKeyCreatePage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/sign-in" {
    export function SignInPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/signed-out" {
    export function SignedOutPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/start" {
    export function Start(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/user-settings/activity" {
    export function ActivityPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/user-settings/resources/invitations" {
    export function InvitationPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/user-settings/resources/organizations" {
    export function OrganizationPage(): import("react").JSX.Element;
}
declare module "sharedComponents/pages/user-settings" {
    export function UserSettings(): import("react").JSX.Element;
}
declare module "sharedComponents/components/anchor/anchor.types" {
    export type Emphasis = 'default' | 'primary-button' | 'secondary-button' | 'secondary-table-button' | 'base' | 'danger';
    export type TextSize = 'default' | 'small';
}
declare module "sharedComponents/components/anchor" {
    import { ReactNode } from 'react';
    import { IconName } from 'components/icon';
    import { Emphasis, TextSize } from "sharedComponents/components/anchor/anchor.types";
    export type AnchorProps = {
        href: string;
        disabled?: boolean;
        emphasis?: Emphasis;
        iconLeft?: IconName;
        iconRight?: IconName;
        openInNewTab?: boolean;
        openInNewTabIcon?: boolean;
        textSize?: TextSize;
        fontWeight?: string;
        children: ReactNode;
        onClick?: () => void;
    };
    export function Anchor({ href, disabled, emphasis, iconLeft, iconRight, openInNewTab, openInNewTabIcon, textSize, fontWeight, children, onClick, }: AnchorProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-bar/app-bar-ui" {
    import { SearchResult } from 'types/store';
    type AppBarUIProps = {
        getSearchResults: (term: string) => SearchResult[];
        saveSearchResult: (term: string) => void;
        playgroundHref: string;
        organizationHref: string;
        user: string;
    };
    export function AppBarUI({ getSearchResults, saveSearchResult, playgroundHref, organizationHref, user }: AppBarUIProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-bar" {
    export function UserContextMenu({ children }: {
        children: React.ReactNode;
    }): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/access-and-validation-header" {
    import { LinkedItem } from 'components/linked-items';
    type AccessAndValidationHeaderProps = {
        items: LinkedItem[];
        documentationLink: string;
    };
    export function AccessAndValidationHeader({ items, documentationLink }: AccessAndValidationHeaderProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/access-and-validation-list" {
    import { type CollectionItem } from 'components/app-endpoint/access-and-validation-list';
    type AccessAndValidationListProps = {
        data: CollectionItem[];
        navigateFunction: (path: string) => void;
        onRowSelected: (ids: string[]) => void;
    };
    export function AccessAndValidationList({ data, navigateFunction, onRowSelected }: AccessAndValidationListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/app-endpoint-dialog" {
    type AppEndpointDialogProps = {
        show: boolean;
        onCloseDialog: () => void;
        variant?: 'resume' | 'pause';
    };
    export function AppEndpointDialog({ show, onCloseDialog, variant }: AppEndpointDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/app-endpoint-offline" {
    type ResumeAppEndpointProps = {
        resumeAppEndpoint: () => void;
    };
    export function AppEndpointOffline({ resumeAppEndpoint }: ResumeAppEndpointProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/app-endpoint-security-navigation" {
    type AppEndpointSecurityNavigationProps = {
        pathToAccessAndValidation: string;
        pathToAppUsers: string;
        pathToAppRoles: string;
        pathToAuthProviders: string;
    };
    export function AppEndpointSecurityNavigation({ pathToAccessAndValidation, pathToAppUsers, pathToAppRoles, pathToAuthProviders, }: AppEndpointSecurityNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/app-endpoint-settings" {
    type AppEndpointSettingsProps = {
        endpointName: string;
        endpointOffline: boolean;
        endpointBucket: string;
        pathToBucket: string;
        permissionToUpdate: boolean;
        permissionToDelete: boolean;
        toggleLoading: boolean;
        showDeleteDialog: boolean;
        toggleEndpoint: () => void;
        toggleDeleteDialog: () => void;
        deleteEndpoint: () => void;
    };
    export function AppEndpointSettings({ endpointName, endpointOffline, endpointBucket, pathToBucket, permissionToUpdate, permissionToDelete, toggleLoading, showDeleteDialog, toggleEndpoint, toggleDeleteDialog, deleteEndpoint, }: AppEndpointSettingsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/app-endpoint-setttings-navigation" {
    export function AppEndpointSettingsNavigation(): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/apply-changes-dialog" {
    type ApplyChangesDialogProps = {
        onClose: () => void;
        show: boolean;
    };
    export function ApplyChangesDialog({ onClose, show }: ApplyChangesDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/delta-sync-form/delta-sync-form.constants" {
    export const DOCUMENTATION_URL = "https://docs.couchbase.com/cloud/app-services/deployment/creating-an-app-endpoint.html#app-endpoint-delta-sync";
}
declare module "sharedComponents/components/app-endpoint/delta-sync-form" {
    type DeltaSyncFormModel = {
        enabled: boolean;
    };
    type DeltaSyncFormProps = {
        defaultValues: DeltaSyncFormModel;
        onSubmit: (value: DeltaSyncFormModel) => void;
    };
    export function DeltaSyncForm({ defaultValues, onSubmit }: DeltaSyncFormProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/import-filters-list/import-filters-list.types" {
    export type CollectionItem = {
        collectionName: string;
        collectionLink: string;
        importStatus: 'enabled' | 'disabled';
        linkToEdit: string;
    };
}
declare module "sharedComponents/components/app-endpoint/import-filters-list" {
    import type { CollectionItem } from "sharedComponents/components/app-endpoint/import-filters-list/import-filters-list.types";
    type ImportFiltersListProps = {
        data: CollectionItem[];
        navigateFunction: (path: string) => void;
    };
    export function ImportFiltersList({ data, navigateFunction }: ImportFiltersListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint/resync-changes-dialog" {
    type ResyncChangesDialogProps = {
        onClose: () => void;
        show: boolean;
    };
    export function ResyncChangesDialog({ onClose, show }: ResyncChangesDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoint-management-tab" {
    type AppEndpointsManagementTabMenuProps = {
        securityPath: string;
        connectPath: string;
        monitoringPath: string;
        settingsPath: string;
    };
    export function AppEndpointsManagementTabMenu({ securityPath, connectPath, monitoringPath, settingsPath, }: AppEndpointsManagementTabMenuProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-endpoints-tab-menu" {
    type AppEndpointsTabMenuProps = {
        appEndpointsPath: string;
        monitoringPath: string;
        settingsPath: string;
    };
    export function AppEndpointsTabMenu({ appEndpointsPath, monitoringPath, settingsPath }: AppEndpointsTabMenuProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-init" {
    export function AuthorizedAppInit(): any;
}
declare module "sharedComponents/components/app-service-list/app-service-list" {
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationProps } from 'components/data-grid/pagination';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { AppServiceResponse } from 'sync/app-service-service/app-service-service.types';
    type AppServiceListProps = {
        data?: AppServiceResponse[];
        onSortChange?: (sortModel: DataGridSortModel) => void;
        perPage: PaginationSize;
        onPaginationChange?: PaginationProps['changePage'];
        totalItems: number;
    };
    export function AppServiceList({ data, onSortChange, perPage, onPaginationChange, totalItems }: AppServiceListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-service-list/app-service-list-dialogs" {
    import { SelectOption } from 'components/inputs/select';
    export type AppServiceListDialogProps = {
        showCreateProjectDialog: boolean;
        showSelectProjectDialog: boolean;
        goToProjects: () => void;
        goToCreateAppService: () => void;
        changeSelectValue: (value: string) => void;
        projectId: string | null;
        projectsClusterCreatePermissionOptions: SelectOption<string>[];
        pathToProjects: string;
        onCloseDialog: () => void;
    };
    export function AppServiceListDialogs({ showCreateProjectDialog, showSelectProjectDialog, goToProjects, goToCreateAppService, projectId, changeSelectValue, projectsClusterCreatePermissionOptions, pathToProjects, onCloseDialog, }: AppServiceListDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-services/app-endpoint/app-endpoint.utils" {
    export const getIconFromStatus: (status: string) => Status;
}
declare module "sharedComponents/components/app-services/app-endpoint" {
    import { NewAppEndpoint as AppEndpointType } from 'sync/app-service-service';
    type AppEndpointProps = {
        appEndpoints: AppEndpointType[];
        createAppEndpoint: () => void;
    };
    export function AppEndpoint({ appEndpoints, createAppEndpoint }: AppEndpointProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-services/app-roles" {
    import { AppRole } from 'sync/app-role-service';
    type AppRolesProps = {
        appRole: AppRole[];
    };
    export function AppRoles({ appRole }: AppRolesProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-services/app-users" {
    import { AppUser } from 'sync/app-service-service';
    type AppUsersProps = {
        appUsers: AppUser[];
        createAppUser: () => void;
    };
    export function AppUsers({ appUsers, createAppUser }: AppUsersProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-services/import-filter-function" {
    type ImportFilterFunctionProps = {
        code: string;
        onSubmit: (code: string) => void;
    };
    export function ImportFilterFunction({ code, onSubmit }: ImportFilterFunctionProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/app-services/import-filters-header" {
    import { LinkedItem } from 'components/linked-items';
    type ImportFiltersHeaderProps = {
        items: LinkedItem[];
        documentationLink: string;
    };
    export function ImportFiltersHeader({ items, documentationLink }: ImportFiltersHeaderProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/banner" {
    export type Variant = 'primary' | 'info' | 'success' | 'warning' | 'error';
    type BannerProps = {
        shortText: string;
        variant: Variant;
        text: string;
        ctaAnchor?: {
            href: string;
            label: string;
        };
        onClose: () => void;
    };
    export function Banner({ shortText, variant, text, ctaAnchor, onClose }: BannerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/bread-crumb/bread-crumb-element" {
    import { ItemsType } from 'components/bread-crumb/bread-crumb-navigation/bread-crumb-navigation.types';
    export function BreadCrumbElement({ label, href, icon, isFirst }: ItemsType): import("react").JSX.Element;
}
declare module "sharedComponents/components/bread-crumb/bread-crumb-navigation/bread-crumb-navigation.types" {
    import { IconName } from 'components/icon';
    export type DataType = 'organization' | 'project' | 'database' | 'appService' | 'appEndpoint';
    export type ItemsType = {
        data?: DataType;
        label: string;
        href: string;
        icon?: IconName;
        isFirst: boolean;
    };
    export type BreadCrumbNavigationProps = {
        items: Omit<ItemsType, 'isFirst'>[];
    };
}
declare module "sharedComponents/components/bread-crumb/bread-crumb-navigation" {
    import type { BreadCrumbNavigationProps } from "sharedComponents/components/bread-crumb/bread-crumb-navigation/bread-crumb-navigation.types";
    export function BreadCrumbNavigation({ items }: BreadCrumbNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/button/button.types" {
    import { ComponentProps } from 'react';
    import { IconName, IconSize } from 'components/icon';
    export type DefaultButtonProps = ComponentProps<'button'> & {
        icon?: IconName;
        iconPosition?: ButtonIconPosition;
        iconClassName?: string;
        variant?: ButtonVariant;
        loading?: boolean;
        block?: boolean;
    };
    export type IconOnlyButtonProps = ComponentProps<'button'> & {
        icon: IconName;
        iconOnly: true;
        iconClassName?: string;
        variant?: IconOnlyButtonVariant;
        label?: string;
        size?: IconSize;
    };
    export type ButtonProps = DefaultButtonProps | IconOnlyButtonProps;
    export type ButtonVariant = 'primary' | 'secondary' | 'secondary-table' | 'tertiary' | 'tertiary-text' | 'quaternary' | 'quinary' | 'senary' | 'danger-secondary' | 'danger-secondary-table' | 'marketing' | 'quick-start' | 'danger';
    export type IconOnlyButtonVariant = 'primary' | 'secondary' | 'secondary-error' | 'warning' | 'surface' | 'success';
    export type ButtonIconPosition = 'left' | 'right';
}
declare module "sharedComponents/components/button/button.utils" {
    import { ButtonProps, ButtonVariant, IconOnlyButtonProps, IconOnlyButtonVariant } from "sharedComponents/components/button/button.types";
    export const getButtonClassByVariant: (variant: ButtonVariant, isDisabled: boolean) => "remove-text-node button rounded text-on-background-alternate text-base cursor-default" | "remove-text-node button button--primary-inverse" | "remove-text-node button button--primary-inverse button--table" | "remove-text-node button button--surface-inverse" | "remove-text-node button button--danger-inverse" | "remove-text-node button button--danger-inverse button--table" | "remove-text-node button button--plain" | "text-on-background-alternate text-base cursor-default" | "border-none text-primary text-base hover:text-primary-hover hover:fill-primary-hover" | "remove-text-node button button--plain button--minimal" | "remove-text-node button button--plain button--minimal-xs" | "remove-text-node button button--plain button--minimal-xs bg-inherit border-none" | "bg-on-background-decoration text-base text-on-background-alternate border-on-background-decoration fill-on-background-alternate cursor-default shadow-sm px-5 py-3 font-medium" | "bg-primary border-primary text-on-primary text-base hover:bg-primary-hover active:bg-primary-active fill-on-primary shadow-sm px-5 py-3 font-medium'" | "remove-text-node button button--primary";
    export const getButtonIconClassByVariant: (variant: IconOnlyButtonVariant) => "text-on-success hover:bg-on-success-decoration hover:fill-background fill-on-success bg-transparent" | "text-on-warning hover:bg-on-warning-decoration fill-on-warning bg-transparent" | "text-on-background hover:bg-on-background-decoration fill-on-error bg-transparent" | "text-on-background hover:bg-on-background-decoration active:bg-primary fill-primary active:fill-on-primary bg-transparent" | "bg-transparent text-on-surface active:bg-surface fill-on-surface active:fill-on-surface-decoration hover:fill-on-surface-decoration" | "bg-background text-on-background hover:bg-on-background-decoration active:bg-primary fill-on-background active:fill-on-primary";
    export const isIconOnlyButton: (props: ButtonProps) => props is IconOnlyButtonProps;
}
declare module "sharedComponents/components/button" {
    export const Button: import("react").ForwardRefExoticComponent<(Omit<import("sharedComponents/components/button/button.types").DefaultButtonProps, "ref"> | Omit<import("sharedComponents/components/button/button.types").IconOnlyButtonProps, "ref">) & import("react").RefAttributes<HTMLButtonElement>>;
}
declare module "sharedComponents/components/button-container/button-container.types" {
    export type ButtonContainerGapSize = 'dialog' | 'default';
}
declare module "sharedComponents/components/button-container" {
    import { ComponentProps } from 'react';
    import { ButtonContainerGapSize } from "sharedComponents/components/button-container/button-container.types";
    type ButtonContainerProps = ComponentProps<'div'> & {
        gap?: ButtonContainerGapSize;
        bottom?: boolean;
    };
    export function ButtonContainer({ gap, bottom, className, ...props }: ButtonContainerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/capella-logo" {
    type CapellaLogoProps = {
        classes?: string;
        fill?: string;
        animated?: boolean;
        width?: number;
        height?: number;
        viewBox?: string;
    };
    export function CapellaLogo({ classes, fill, animated, width, height, viewBox, }: CapellaLogoProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/card" {
    import { IconName } from 'components/icon';
    type CardProps = {
        title: string;
        body: string;
        onClick: () => void;
        loading?: boolean;
        linkText?: string;
        linkHref?: string;
        buttonText?: string;
        disabled?: boolean;
        icon?: IconName;
        buttonLeftIcon?: IconName;
    };
    export function Card({ icon, title, body, loading, linkText, linkHref, buttonText, onClick, disabled, buttonLeftIcon, }: CardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/charts/bar-chart" {
    type BarChartItem = {
        item?: string;
        values: {
            label: string;
            value: number;
        }[];
    };
    type BarChartProps = {
        data: BarChartItem[];
        isGrouped?: boolean;
    };
    export function BarChart({ data, isGrouped }: BarChartProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/charts/doughnut-chart" {
    import { BasicChartDataItem } from 'types/charts';
    type DoughnutChartProps = {
        data: BasicChartDataItem[];
        animation?: boolean;
    };
    export function DoughnutChart({ data, animation }: DoughnutChartProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/charts/line-chart/line-chart.constants" {
    export const DEFAULT_DISPLAY_REFERENCE_LINE = true;
    export const DEFAULT_LINE_WIDTH = 2;
    export const DEFAULT_POINT_RADIUS = 3;
    export const DEFAULT_ZOOM_RANGE = 20;
    export const DEFAULT_TICKS_GAP = 28;
    export const DEFAULT_DISABLE_TICK_ROTATION = true;
    export const DEFAULT_GRID_AXES = "y";
    export const DEFAULT_ZOOMABLE = true;
    export const DEFAULT_ZOOM_AXIS = "x";
    export const DEFAULT_ZOOM_SPEED = 0.05;
    export const DEFAULT_X_LABEL_FORMATTER: (value: string) => string;
    export const DEFAULT_Y_LABEL_FORMATTER: (value: number) => string;
}
declare module "sharedComponents/components/charts/line-chart/line-chart.types" {
    type DataPoint = {
        label: string;
        value: number;
    };
    export type LineChartDataset = {
        name: string;
        data: DataPoint[];
    };
}
declare module "sharedComponents/components/charts/line-chart/line-chart.utils" {
    import { LineChartDataset } from "sharedComponents/components/charts/line-chart/line-chart.types";
    type MapLineChartDataToDatasetProps = {
        data: LineChartDataset[];
        pointRadius: number;
        lineWidth: number;
    };
    export const mapLineChartDataToDatasetProps: ({ data, pointRadius, lineWidth }: MapLineChartDataToDatasetProps) => {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            pointRadius: number;
            backgroundColor: any;
            pointHoverRadius: number;
            borderColor: any;
            borderWidth: number;
        }[];
    };
}
declare module "sharedComponents/components/charts/line-chart" {
    import { ChartAxis } from 'types/charts';
    import { LineChartDataset } from "sharedComponents/components/charts/line-chart/line-chart.types";
    type LineChartProps = {
        data: LineChartDataset | LineChartDataset[];
        groupId?: string;
        displayReferenceLine?: boolean;
        lineWidth?: number;
        pointRadius?: number;
        disableTickRotation?: boolean;
        ticksGap?: number;
        grid?: ChartAxis;
        zoomable?: boolean;
        zoomAxis?: ChartAxis;
        minZoomRange?: number;
        zoomSpeed?: number;
        xLabelFormatter?: (value: string) => string;
        yLabelFormatter?: (value: number) => string;
    };
    export function LineChart({ data, groupId, displayReferenceLine, lineWidth, pointRadius, disableTickRotation, ticksGap, grid, zoomable, zoomAxis, minZoomRange, zoomSpeed, xLabelFormatter, yLabelFormatter, }: LineChartProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/charts/pie-chart" {
    import { BasicChartDataItem } from 'types/charts';
    type PieChartProps = {
        data: BasicChartDataItem[];
        animation?: boolean;
    };
    export function PieChart({ data, animation }: PieChartProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/cloud-service-providers-radio-card" {
    import { RadioCardValue } from 'components/radio-card';
    type CloudServiceProvidersRadioCardProps = {
        options?: string[];
        value?: string;
        labelHidden?: boolean;
        label?: string;
        onChange?: (value: RadioCardValue) => void;
    };
    export function CloudServiceProvidersRadioCard({ options, value, label, labelHidden, onChange, }: CloudServiceProvidersRadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/code-block" {
    type CodeBlockProps = {
        value: string;
        label?: string;
    };
    export function CodeBlock({ value, label }: CodeBlockProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/code-editor-result" {
    type CodeEditorResultProps = {
        value: string;
        height?: number;
    };
    export function CodeEditorResult({ value, height }: CodeEditorResultProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/code-editor-tutorial" {
    import { CSSDimension, SupportedLanguage, SupportedThemes } from 'components/editor/editor.types';
    type CodeEditorTutorialProps = {
        value: string;
        runQuery: () => void;
        height?: CSSDimension;
        runQueryIcon?: boolean;
        results?: boolean;
        language?: SupportedLanguage;
        theme?: SupportedThemes;
    };
    export function CodeEditorTutorial({ value, runQuery, height, runQueryIcon, results, language, theme, }: CodeEditorTutorialProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/common-organization" {
    import { FetchQuery } from 'components/providers/fetch/fetch.types';
    import { ProjectResponse } from 'sync/project-service';
    export type CommonOrganizationForm = {
        name: string;
    };
    type CommonOrganizationProps = {
        organizationId: string;
        projectList: ProjectResponse[];
        query: FetchQuery;
        onCreateProject: (values: CommonOrganizationForm) => void;
        showDialog: boolean;
        setShowDialog: (value: boolean) => void;
    };
    export function CommonOrganization({ organizationId, projectList, query, onCreateProject, showDialog, setShowDialog, }: CommonOrganizationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/connected-cloud-service-providers-radio-card/connected-cloud-service-providers-radio-card.types" {
    import { IconName } from 'components/icon';
    import { RadioCardOption } from 'components/radio-card';
    export type Options = RadioCardOption<{
        icon: IconName;
    }>;
}
declare module "sharedComponents/components/connected-cloud-service-providers-radio-card" {
    import { RadioCardValue } from 'components/radio-card/';
    import { Options } from "sharedComponents/components/connected-cloud-service-providers-radio-card/connected-cloud-service-providers-radio-card.types";
    type ConnectedCloudServiceProvidersRadioCardProps = {
        options: Options[];
        value?: string;
        labelHidden?: boolean;
        label?: string;
        onChange?: (value: RadioCardValue) => void;
    };
    export function ConnectedCloudServiceProvidersRadioCard({ options, value, labelHidden, label, onChange, }: ConnectedCloudServiceProvidersRadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/connected-radio-card" {
    import { RadioCardOption, RadioCardValue } from 'components/radio-card';
    type ConnectedRadioCardProps<T> = {
        label: string;
        options: RadioCardOption<T>[];
        value: RadioCardValue;
        labelHidden?: boolean;
        column?: boolean;
        bgOnSelect?: string;
        onChange: (value: RadioCardValue) => void;
        children?: React.ReactNode;
    };
    export function ConnectedRadioCard<T>({ label, options, value, labelHidden, column, bgOnSelect, onChange, children, }: ConnectedRadioCardProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/containers/component-container/component-container.types" {
    export type ContainerGapSize = 'small' | 'medium' | 'large' | 'xlarge' | 'default';
    export type ContainerGapDirection = 'both' | 'top' | 'bottom' | 'offset-top' | 'offset-bottom' | 'offset-both';
}
declare module "sharedComponents/components/containers/component-container" {
    import { ContainerGapDirection, ContainerGapSize } from "sharedComponents/components/containers/component-container/component-container.types";
    export type ComponentContainerProps = {
        gap?: ContainerGapSize;
        gapDirection?: ContainerGapDirection;
        children: React.ReactNode;
    };
    export function ComponentContainer({ gap, gapDirection, children }: ComponentContainerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/containers/split-container" {
    import { ReactNode } from 'react';
    type SplitContainerProps = {
        title: ReactNode;
        left?: ReactNode;
        right?: ReactNode;
        split: 'equal' | 'unequal';
        large?: 'left' | 'right';
        mobile?: 'left-top' | 'right-top';
    };
    export function SplitContainer({ title, left, right, split, large, mobile }: SplitContainerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/copy-field/copy-field.constants" {
    export const COPY_DELAY_IN_MS = 1000;
}
declare module "sharedComponents/components/copy-field" {
    import { IconName, IconSize } from 'components/icon';
    export type CopyFieldProps = {
        icon?: IconName;
        iconSize?: IconSize;
        label?: string;
        value: string;
        secret?: boolean;
        copyText?: string;
        copiedText?: string;
        slim?: boolean;
    };
    export function CopyField({ label, icon, iconSize, value, secret, copyText, copiedText, slim, }: CopyFieldProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/create-app-service-summary" {
    import { CreateAppServiceForm } from 'components/project/app-service';
    import { TrialDetails } from 'hooks/use-current-trial/use-current-trial.types';
    import { AppServiceDeploymentCostResponse } from 'sync/app-service-service';
    import { DatabaseDeploymentCostResponse } from 'sync/configuration-service';
    import { DatabaseProvider, DatabaseResponse } from 'sync/database-service';
    import { ProjectResponse } from 'sync/project-service';
    type CreateAppServiceSummaryProps = {
        isValid: boolean;
        formValues: CreateAppServiceForm;
        totalCreditsPerHour: string | null;
        loading: boolean;
        project?: ProjectResponse;
        trial?: TrialDetails;
        appServiceCosts?: AppServiceDeploymentCostResponse;
        databaseCosts?: DatabaseDeploymentCostResponse;
        selectedProvider?: DatabaseProvider;
        selectedDatabase?: DatabaseResponse;
    };
    export function CreateAppServiceSummary({ isValid, databaseCosts, appServiceCosts, formValues, selectedDatabase, selectedProvider, totalCreditsPerHour, loading, project, trial, }: CreateAppServiceSummaryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/csp-regions-radio-card" {
    import { RadioCardValue } from 'components/radio-card';
    import { Option } from 'types/options';
    type CSPRegionsRadioCardProps = {
        csp?: string;
        value?: string;
        labelHidden?: boolean;
        options?: Option[];
        label?: string;
        mode?: 'serverless' | 'provisioned' | 'provisionedTrial';
        bgOnSelect?: string;
        onChange: (value: RadioCardValue) => void;
    };
    export function CspRegionsRadioCard({ csp, value, labelHidden, options: defaultOptions, label, mode, bgOnSelect, onChange, }: CSPRegionsRadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/cta" {
    import type { Variant } from 'components/cta/cta.types';
    export type CtaProps = {
        disabled?: boolean;
        variant?: Variant;
        label: React.ReactNode;
        href?: string;
        onClick?: React.MouseEventHandler<HTMLButtonElement>;
    };
    export function Cta({ disabled, variant, href, onClick, label }: CtaProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-grid/cells" {
    import { ToggleValue } from 'components/toggle';
    import { Option } from 'types/options';
    type ToggleCellProps<T> = {
        value: T;
        options: Option[];
        onChange?: (value: T) => void;
    };
    export function ToggleCell({ value, options, onChange }: ToggleCellProps<ToggleValue>): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-grid/data-grid.types" {
    import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
    export type DataGridMode = 'light' | 'dark';
    export type CoreAgGridProps<TData> = AgGridReactProps<TData> | AgReactUiProps<TData>;
    export type DataGridSortModel = {
        field: string;
        order: 'asc' | 'desc';
    } | {
        field: null;
        order: null;
    };
    export type CellRenderer<T, V = string> = (props: {
        data: T;
        value: V;
    }) => React.ReactNode;
}
declare module "sharedComponents/components/data-grid/data-grid.utils" {
    import { ColDef, GridSizeChangedEvent } from 'ag-grid-community';
    import { CoreAgGridProps, DataGridMode, DataGridSortModel } from "sharedComponents/components/data-grid/data-grid.types";
    export const getIconDefinitions: (mode: DataGridMode) => {
        [k: string]: string;
    };
    export const HEADER_CLASSNAME = "font-primary text-sm font-medium uppercase leading-none";
    export function attachExtraColumnProperties<T>(columnDefs: CoreAgGridProps<T>['columnDefs']): (ColDef<T> | import("ag-grid-community").ColGroupDef<T>)[];
    export function getDataGridSortHandler<T>(onSortChange?: (model: DataGridSortModel) => void): NonNullable<CoreAgGridProps<T>['onSortChanged']>;
    export const DESKTOP_BREAKPOINT = 1200;
    export function dataGridResizeHandler<T>(event: GridSizeChangedEvent<T>): void;
}
declare module "sharedComponents/components/data-grid/filter" {
    type QuickFilterProps = {
        placeholder?: string;
        changeQuickFilter: (value: string) => void;
    };
    export function QuickFilter({ placeholder, changeQuickFilter }: QuickFilterProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-grid/pagination/pagination.utils" {
    const PER_PAGE: readonly [10, 25, 50, 100];
    export type PaginationSize = (typeof PER_PAGE)[number];
    export const PER_PAGE_OPTIONS: {
        label: string;
        value: 25 | 10 | 50 | 100;
    }[];
    export const getMetadataCopy: ({ perPage, totalItems }: {
        perPage: number;
        totalItems: number;
    }) => string;
    export const shouldDisplayPerPageControl: ({ totalItems }: {
        totalItems: number;
    }) => boolean;
    export const shouldDisplayPageControl: ({ perPage, totalItems }: {
        perPage: number;
        totalItems: number;
    }) => boolean;
    export const getPageOptions: ({ perPage, totalItems }: {
        perPage: number;
        totalItems: number;
    }) => {
        label: string;
        value: any;
    }[];
}
declare module "sharedComponents/components/data-grid/pagination" {
    import { PaginationSize } from "sharedComponents/components/data-grid/pagination/pagination.utils";
    export type PaginationProps = {
        perPage: PaginationSize;
        totalItems: number;
        page: number;
        changePage: (page: number, perPage: PaginationSize) => void;
    };
    export function Pagination({ perPage, totalItems, page, changePage }: PaginationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-grid/pagination/index" {
    export * from "sharedComponents/components/data-grid/pagination";
}
declare module "sharedComponents/components/data-grid" {
    import { CoreAgGridProps, DataGridMode, DataGridSortModel } from "sharedComponents/components/data-grid/data-grid.types";
    import { PaginationSize } from "sharedComponents/components/data-grid/pagination/pagination.utils";
    import 'ag-grid-community/styles/ag-grid.css';
    import 'ag-grid-community/styles/ag-theme-alpine.css';
    export type DataGridProps<TData> = Omit<CoreAgGridProps<TData>, 'onSortChanged' | 'onPaginationChanged'> & {
        mode: DataGridMode;
        onSortChange?: (sortModel: DataGridSortModel) => void;
        onPaginationChanged?: (page: number, perPage: PaginationSize) => void;
        paginationPageSize?: PaginationSize;
        paginationPage?: number;
        totalItems?: number;
        quickFilter?: boolean;
        quickFilterPlaceholder?: string;
        isWithUpperTotalCount?: boolean;
    };
    export function DataGrid<T>({ domLayout, columnDefs, mode, onSortChange, quickFilterPlaceholder, isWithUpperTotalCount, onPaginationChanged, ...props }: DataGridProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-table/array-cell" {
    import { HeadersData } from 'components/data-table/data-table.types';
    type ArrayCellProps = {
        value: Record<string, unknown>;
        headers: HeadersData;
        cellTitle: string;
        first?: boolean;
    };
    export function ArrayCell({ value, cellTitle, first, headers }: ArrayCellProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/data-table" {
    import './data-table.scss';
    type DataTableProps = {
        data?: Record<string, unknown>[];
        dataFallback: Record<string, unknown>[];
    };
    export function DataTable({ data, dataFallback }: DataTableProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/database-jobs-bar" {
    import { Job } from 'sync/database-service';
    export function DatabaseJobsBar({ currentJob }: {
        currentJob?: Job;
    }): import("react").JSX.Element;
}
declare module "sharedComponents/components/database-row-menu" {
    import { DatabaseResponse } from 'sync/database-service';
    type DatabaseRowMenuProps = {
        rowData: DatabaseResponse;
        organizationId: string;
        invalidateResource: () => void;
    };
    export function DatabaseRowMenu({ organizationId, rowData, invalidateResource }: DatabaseRowMenuProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/database-tab-navigation" {
    type DatabaseTabNavigationProps = {
        dataToolsPath: string;
        appServicesPath: string;
        connectPath: string;
        monitoringPath: string;
        backupPath: string;
        settingsPath: string;
    };
    export function DatabaseTabNavigation({ dataToolsPath, appServicesPath, connectPath, monitoringPath, backupPath, settingsPath, }: DatabaseTabNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/databases-screen" {
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { DatabaseListResponse } from 'sync/database-service';
    type DatabasesScreenProps = {
        resourceName: 'Organization' | 'Project';
        organizationId: string;
        databasesResponse?: null | DatabaseListResponse;
        trialEnabled: boolean;
        children?: React.ReactNode;
        perPage: PaginationSize;
        onPaginationChanged: (page: number, perPage: PaginationSize) => void;
        onSortChange: (data: DataGridSortModel) => void;
        loading: boolean;
        invalidateResource: () => void;
    };
    export function DatabasesScreen({ resourceName, organizationId, databasesResponse, children, trialEnabled, perPage, onPaginationChanged, onSortChange, loading, invalidateResource, }: DatabasesScreenProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/delete-dialog" {
    import { ButtonVariant } from 'components/button';
    import { Variant } from 'components/info-panel';
    export type DeleteDialogProps = {
        title?: string;
        message?: string;
        label: string;
        show?: boolean;
        hideClose?: boolean;
        confirmationValue?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        cancelLabel?: string;
        submitLabel?: string;
        submitVariant?: ButtonVariant;
        cancelVariant?: ButtonVariant;
        warningVariant?: Variant;
        contentAboveWarning?: React.ReactNode;
        contentBelowWarning?: React.ReactNode;
        content?: React.ReactNode;
    };
    export function DeleteDialog({ title, message, label, show, hideClose, confirmationValue, onConfirm, onCancel, cancelLabel, submitLabel, submitVariant, cancelVariant, warningVariant, contentAboveWarning, contentBelowWarning, content, }: DeleteDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/delete-organization" {
    type DeleteOrganizationProps = {
        raiseSupportTicketHref: string;
        termsOfServiceHref: string;
    };
    export function DeleteOrganization({ raiseSupportTicketHref, termsOfServiceHref }: DeleteOrganizationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/dialog" {
    import { ButtonVariant } from 'components/button';
    export type DialogProps = {
        title?: string;
        message?: string;
        label: string;
        show: boolean;
        onConfirm?: () => void;
        onCancel?: () => void;
        cancelLabel?: string;
        submitLabel?: string;
        submitVariant?: ButtonVariant;
        cancelVariant?: ButtonVariant;
        className?: string;
        disabledButton?: boolean;
        children?: React.ReactNode;
    };
    export function Dialog({ title, message, label, show, onConfirm, onCancel, cancelLabel, submitLabel, submitVariant, cancelVariant, className, disabledButton, children, }: DialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/download-field/download-field.constants" {
    export const DOWNLOAD_STATE: {
        download: string;
        downloaded: string;
    };
    export const COPY_STATE: {
        copy: string;
        copied: string;
    };
}
declare module "sharedComponents/components/download-field/download-field.types" {
    import { IconName } from 'components/icon';
    export type Download = {
        label: string;
        icon?: IconName;
        value: string;
        secret?: boolean;
        file: string;
        onDownload?: (values: Download) => void;
    };
}
declare module "sharedComponents/components/download-field" {
    import { Download } from "sharedComponents/components/download-field/download-field.types";
    type DownloadFieldProps = {
        downloads: Download[];
        onCopy?: (value: string) => void;
    };
    export function DownloadField({ downloads, onCopy }: DownloadFieldProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/editor/utils/custom-languages" {
    export const isCustomLanguage: (language: SupportedLanguage) => language is CustomLanguage;
    export const generateSchema: (language: CustomLanguage, schemaDoc?: SchemaDoc) => any;
    export const generateLanguage: (language: CustomLanguage, schemaDoc?: SchemaDoc) => any;
}
declare module "sharedComponents/components/editor/utils/configure-monaco" { }
declare module "sharedComponents/components/editor/editor.types" {
    import { editor as editorNamespace } from 'monaco-editor';
    export type CustomLanguage = 'N1QL' | 'SqlPlusPlus' | 'CustomJava';
    export type SupportedLanguage = CustomLanguage | 'json' | 'javascript' | 'typescript' | 'shell' | 'java' | 'python' | 'csharp' | 'text';
    export type SupportedThemes = 'vs-dark' | 'vs-light';
    export type OnRunHandler = () => void;
    export type PasteEventHandler = (e: editorNamespace.IPasteEvent) => void;
    export type CSSDimension = `${number}${'em' | 'ex' | 'ch' | 'rem' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'px' | 'cm' | 'mm' | 'in' | 'pt' | 'pc' | '%'}`;
}
declare module "sharedComponents/components/editor/languages/types" {
    import type { languages } from 'monaco-editor';
    type DisposeFunction = () => void;
    export type LanguageRegistrar = {
        language: (schemaDoc?: SchemaDoc) => Promise<DisposeFunction>;
        schema: (schemaDoc?: SchemaDoc) => Promise<DisposeFunction>;
    };
    export type LanguageWords = {
        kind: languages.CompletionItemKind;
        wordsToMatch: string[];
        words: string[];
    }[];
    export type SchemaDoc = {
        /**
         * jsonSchema is as follows:
         * [
         *    // schema
         *   'travel-sample',
         *   'travel-sample.inventory.',
         *   'travel-sample.inventory.airline',
         *   'travel-sample.inventory.hotel',
         *   // attributes
         *   'name',
         *   'callsign',
         *   'country'
         * ]
         */
        jsonSchema: string[];
        indexes: string[];
    };
}
declare module "sharedComponents/components/editor/utils/get-styles" {
    export const getPlayButtonStyles: (theme: SupportedThemes) => string;
    export const getEditorStyles: (theme: SupportedThemes) => {
        className: string;
        style: {
            backgroundColor: string;
            borderColor?: undefined;
        };
    } | {
        className: string;
        style: {
            borderColor: string;
            backgroundColor: string;
        };
    };
}
declare module "sharedComponents/components/editor" {
    import "sharedComponents/components/editor/utils/configure-monaco";
    import { OnChange } from '@monaco-editor/react';
    import { CSSDimension, OnRunHandler, PasteEventHandler, SupportedLanguage, SupportedThemes } from "sharedComponents/components/editor/editor.types";
    import type { SchemaDoc } from "sharedComponents/components/editor/languages/types";
    import './styles/editor.scss';
    type EditorProps = {
        editorId?: string;
        language: SupportedLanguage;
        value?: string;
        theme?: SupportedThemes;
        onRun?: OnRunHandler;
        readOnly?: boolean;
        schemaDoc?: SchemaDoc;
        fontSize?: number;
        lineHeight?: number;
        wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
        onChange?: OnChange;
        onDidPaste?: PasteEventHandler;
        height?: CSSDimension;
    };
    export function Editor({ editorId, language, value, theme, onRun, readOnly, schemaDoc, fontSize, lineHeight, wordWrap, onChange, onDidPaste, height, }: EditorProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/empty" {
    import { CtaProps } from 'components/cta';
    import { IconName } from 'components/icon';
    export type EmptyProps = {
        title: string;
        icon?: IconName;
        children?: React.ReactNode;
        tooltipContent?: React.ReactNode;
        ctaProps?: CtaProps;
    };
    export function Empty({ icon, title, tooltipContent, children, ctaProps }: EmptyProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/error/global-catch/global-catch-ui" {
    import { ReactNode } from 'react';
    import { Goof, NetworkGoof } from 'error/goof.interfaces';
    type GlobalCatchProps = {
        children?: ReactNode;
        globalCatch: Goof | NetworkGoof | null;
        onClick: () => void;
    };
    export function GlobalCatchUI({ children, globalCatch, onClick }: GlobalCatchProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/error/global-catch" {
    import { ReactNode } from 'react';
    type GlobalCatchProps = {
        children?: ReactNode;
    };
    export function GlobalCatch({ children }: GlobalCatchProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/error/not-found" {
    type NotFoundProps = {
        link: string;
    };
    export function NotFound({ link }: NotFoundProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/eventing/eventing-import-function-dialog" {
    type EventingImportFunctionDialogProps = {
        show: boolean;
        files: File[];
        downloadFile?: boolean;
        displayFileList?: boolean;
        onFileChange: (files: File[]) => void;
        onFileDropError: (isDropError: boolean) => void;
        onClose: () => void;
    };
    export function EventingImportFunctionDialog({ onClose, show, onFileChange, files, downloadFile, displayFileList, onFileDropError, }: EventingImportFunctionDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/file" {
    type FileProps = {
        unit?: 'KB' | 'MB';
        download?: boolean;
        file: File;
        onRemove?: (fileName: string) => void;
    };
    export function File({ unit, download, file, onRemove }: FileProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/flags-provider" {
    export function FlagsProvider(): any;
}
declare module "sharedComponents/components/flyout-menu/flyout-menu/flyout-menu.types" {
    import { ElementType } from 'react';
    import { IconName } from 'components/icon';
    export type FlyoutMenuOption = {
        group?: string;
        key: string;
    } & ({
        href?: string;
        icon?: IconName;
        label: string;
        onClick?: (event: React.MouseEvent<HTMLElement>) => void;
        openInNewTab?: boolean;
    } | {
        Component: ElementType;
    });
    export type FlyoutMenuVariant = 'default' | 'tight';
}
declare module "sharedComponents/components/flyout-menu/flyout-menu" {
    import { IconName } from 'components/icon/icon.types';
    import { FlyoutMenuOption, FlyoutMenuVariant } from "sharedComponents/components/flyout-menu/flyout-menu/flyout-menu.types";
    type FlyoutMenuProps = {
        icon?: IconName;
        variant?: FlyoutMenuVariant;
        label?: string;
        options: FlyoutMenuOption[];
        children?: React.ReactNode;
    };
    export function FlyoutMenu({ icon, options, label, variant, children }: FlyoutMenuProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/flyout-menu/flyout-menu-item/flyout-menu-item.types" {
    import { type NavLinkProps } from 'react-router-dom';
    export type FlyoutMenuItemVariant = 'default' | 'tight';
    export type FlyoutMenuItemButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    export type FlyoutMenuItemAnchorProps = Omit<NavLinkProps, 'onClick' | 'children'>;
}
declare module "sharedComponents/components/flyout-menu/flyout-menu-item" {
    import { IconName } from 'components/icon';
    import { FlyoutMenuItemAnchorProps, FlyoutMenuItemButtonProps, FlyoutMenuItemVariant } from "sharedComponents/components/flyout-menu/flyout-menu-item/flyout-menu-item.types";
    export type FlyoutMenuItemProps = {
        icon?: IconName;
        variant?: FlyoutMenuItemVariant;
        children?: React.ReactNode;
    } & (FlyoutMenuItemButtonProps | FlyoutMenuItemAnchorProps);
    export const ACTIVE_CLASSNAME = "font-medium bg-information hover:bg-information focus:bg-information";
    export const INACTIVE_CLASSNAME = "hover:bg-on-background-decoration focus:bg-on-background-decoration";
    export function FlyoutMenuItem({ children, className, icon, variant, ...nativeProps }: FlyoutMenuItemProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/form" {
    import { ComponentProps, ReactNode } from 'react';
    import { ButtonVariant } from 'components/button';
    export type FormProps = ComponentProps<'form'> & {
        onCancel?: () => void;
        submitLabel?: string;
        submitVariant?: ButtonVariant;
        cancelLabel?: string;
        cancelVariant?: ButtonVariant;
        disabled?: boolean;
        cancelDisabled?: boolean;
        loading?: boolean;
        reverseButtons?: boolean;
        errorText?: string;
        footer?: ReactNode;
        readonly?: boolean;
        fullWidthSubmit?: boolean;
    };
    export const Form: import("react").ForwardRefExoticComponent<Omit<FormProps, "ref"> & import("react").RefAttributes<HTMLFormElement>>;
}
declare module "sharedComponents/components/form-element-container/form-element-container.types" {
    export type FormElementContainerGapSize = 'dialog' | 'default';
}
declare module "sharedComponents/components/form-element-container" {
    import { HTMLAttributes } from 'react';
    import { FormElementContainerGapSize } from "sharedComponents/components/form-element-container/form-element-container.types";
    type FormElementContainerProps = HTMLAttributes<HTMLDivElement> & {
        gap?: FormElementContainerGapSize;
        bottom?: boolean;
        alwaysFullWidth?: boolean;
        indent?: boolean;
    };
    export function FormElementContainer({ gap, bottom, alwaysFullWidth, indent, className, ...props }: FormElementContainerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/full-page-error" {
    type FullPageErrorProps = {
        children?: React.ReactNode;
    };
    export function FullPageError({ children }: FullPageErrorProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/horizontal-stacked-bar/horizontal-stacked-bar.types" {
    export type Option = {
        label: string;
        value: number;
        warning?: boolean;
    };
}
declare module "sharedComponents/components/horizontal-stacked-bar/horizontal-stacked-bar-utils" {
    export const calcWidth: (value: number, total: number) => string;
}
declare module "sharedComponents/components/horizontal-stacked-bar" {
    import { Option } from "sharedComponents/components/horizontal-stacked-bar/horizontal-stacked-bar.types";
    type HorizontalStackedBarProps = {
        options: Option[];
        total: number;
        showLoader: boolean;
    };
    export function HorizontalStackedBar({ options, total, showLoader }: HorizontalStackedBarProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/icon/icon.types" {
    export type IconName = '10221-icon-service-Azure-Active-Directory' | 'activity' | 'add-circle' | 'add-user' | 'admin' | 'analytics' | 'api-keys' | 'app-services' | 'archive' | 'arrow-down-from-line' | 'arrow-down-square-triangle' | 'arrow-right-arrow-left' | 'arrow-right' | 'arrow-up-right-from-square' | 'arrow-up-to-line' | 'azure-active-directory-logo' | 'azure-active-directory-text' | 'badge-check' | 'bell' | 'bill' | 'billing' | 'brackets-curly' | 'bucket' | 'building-user' | 'calendar' | 'capella-logo-color' | 'caret-down-solid' | 'caret-right-solid' | 'certificate' | 'check-double' | 'check' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevrons-left' | 'chevrons-right' | 'circle-check' | 'circle-ellipsis' | 'circle-exclamation' | 'circle-notch' | 'circle-pause' | 'circle-question' | 'circle-small' | 'circle-user' | 'circle-xmark' | 'circle' | 'clock' | 'close' | 'cloud-arrow-up' | 'clouds-stacked' | 'clouds' | 'cluster' | 'clusters' | 'code' | 'coin-dollar-sign' | 'collection' | 'comment' | 'configuration' | 'copy' | 'couchbase-capella-block' | 'couchbase-capella-inline' | 'couchbase' | 'credentials' | 'credit-card' | 'credits-per-hour-per-gb' | 'critical' | 'cyberark-logo' | 'dashboard' | 'data' | 'database-serverless' | 'database' | 'delete' | 'diagram-project' | 'document' | 'documentation' | 'down-arrow' | 'down-chevron' | 'download-file' | 'download' | 'duotone-spinner-third' | 'edit' | 'email' | 'envelope-open-text' | 'error' | 'eventing' | 'eye-slash' | 'eye' | 'file-chart-column' | 'file-invoice-dollar' | 'file-magnifying-glass' | 'file-shield' | 'file-xmark' | 'filter' | 'fts' | 'gear' | 'get-started' | 'globe' | 'graduation-cap-light' | 'graduation-cap' | 'hourglass' | 'house-building' | 'icon-service-cyberark' | 'icon-service-ping-identity' | 'id-card-clip' | 'index' | 'info' | 'kebab-menu' | 'key' | 'languages-android' | 'languages-c' | 'languages-dotnet' | 'languages-go' | 'languages-ios' | 'languages-java' | 'languages-nodejs' | 'languages-objective-c' | 'languages-php' | 'languages-python' | 'languages-ruby' | 'languages-scala' | 'languages-swift' | 'laptop-code' | 'laptop-phone' | 'left-arrow-long' | 'left-chevron' | 'lightbulb' | 'link-simple' | 'link' | 'location-dot' | 'lock' | 'logo-aws' | 'logo-azure' | 'logo-gcp' | 'magnifying-glass' | 'maintenance' | 'mfa' | 'minus-circle' | 'minus' | 'mobile-signal' | 'money-check-dollar-pen' | 'move' | 'okta-circle' | 'okta-text' | 'organization' | 'page-arrow' | 'page-pencil' | 'page-search' | 'password' | 'pause' | 'phone' | 'ping-logo' | 'placeholder' | 'plan' | 'play' | 'plus' | 'profile' | 'project' | 'projects' | 'power-off' | 'query' | 'recovery-point-objective' | 'refresh' | 'region' | 'retry' | 'right-arrow-long' | 'right-chevron' | 'rotate' | 'run-query' | 'scope' | 'screwdriver-wrench' | 'search' | 'secure' | 'security-settings' | 'server' | 'settings' | 'shield' | 'sign-out' | 'slash' | 'solid-check' | 'solid-chevron-down' | 'solid-circle-check' | 'solid-circle-ellipsis' | 'solid-circle-exclamation' | 'solid-circle-notch' | 'solid-circle-pause' | 'solid-circle-xmark' | 'solid-circle' | 'solid-ellipsis-vertical-black' | 'solid-ellipsis-vertical' | 'solid-question' | 'solid-rotate' | 'solid-xmark' | 'sort-toggle' | 'sort' | 'sunrise' | 'spinner-third' | 'star' | 'stop' | 'store' | 'support-ticket' | 'support' | 'telephone' | 'tick' | 'time' | 'toggle-off' | 'toggle-on' | 'trash-can' | 'triangle-exclamation' | 'up-arrow' | 'up-chevron' | 'upgrade-trial' | 'upload' | 'usage-summary' | 'user-group' | 'user-lock' | 'user' | 'users' | 'view' | 'warning';
    export type IconSize = 'xsmall' | 'small' | 'default' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge' | 'xxxxlarge' | 'xxxxxlarge' | 'column-header' | 'logo-ping' | 'logo-azure' | 'logo-cyberark' | 'big-cloud-dropzone';
    export type IconStyle = 'block' | 'default';
}
declare module "sharedComponents/components/icon" {
    import { IconName, IconSize, IconStyle } from "sharedComponents/components/icon/icon.types";
    interface IconProps {
        title?: string;
        name: IconName;
        style?: IconStyle;
        className?: string;
        size?: IconSize;
    }
    export function Icon({ title, name, size, style, className }: IconProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/import-export/import-export.utils" {
    type ExportFileProps = {
        value: string;
        type?: 'json' | 'js';
        fileName?: string;
    };
    export const exportFile: ({ value, type, fileName }: ExportFileProps) => void;
}
declare module "sharedComponents/components/import-export" {
    import { ButtonVariant } from 'components/button';
    type ImportExportProps = {
        value: string;
        onChange: (value: string) => void;
        buttonVariant?: ButtonVariant;
        withIcon?: boolean;
    };
    export function ImportExport({ value, onChange, buttonVariant, withIcon }: ImportExportProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/import-export-json" {
    import { z } from 'zod';
    type ImportExportJsonProps<T> = {
        exportValue: T;
        onImport: (data: T) => void;
        schemaParser: z.ZodType<T>;
        onImportError: (error: string) => void;
    };
    export function ImportExportJson<T>({ exportValue, schemaParser, onImportError, onImport }: ImportExportJsonProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/info-panel" {
    import { ReactNode } from 'react';
    export type Variant = 'primary' | 'critical' | 'warning' | 'info' | 'check' | 'warning-with-bg' | 'danger-with-bg';
    type InfoPanelProps = {
        variant?: Variant;
        children: ReactNode;
    };
    export function InfoPanel({ variant, children }: InfoPanelProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/autocomplete/autocomplete" {
    import { IconName } from 'components/icon';
    import { Option } from 'types/options';
    type AutocompleteProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: Option;
        valid?: boolean;
        leftIcon?: IconName;
        rightIcon?: IconName;
        onRightIcon?: () => void;
        error?: string;
        meta?: string;
        placeholder?: string;
        required?: boolean;
        options: Option[];
        onInput?: (value: string) => void;
        inputWrapperChildrenClasses?: string;
        keepOpen?: boolean;
        showChevron?: boolean;
        hideLabel?: boolean;
        onSelect?: (option: Option) => void;
        focusOnMount?: boolean;
        alwaysDisplayOptions?: boolean;
    };
    export const Autocomplete: import("react").ForwardRefExoticComponent<AutocompleteProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/autocomplete/chip/chip.types" {
    export type Status = 'error' | 'warning' | 'success' | 'info' | 'notice';
    export type ChipType = 'input' | 'info' | 'status';
}
declare module "sharedComponents/components/inputs/autocomplete/chip" {
    import { IconName } from 'components/icon';
    import { ChipType, Status } from "sharedComponents/components/inputs/autocomplete/chip/chip.types";
    export type ChipProps = {
        onClose?: () => void;
        iconLeft?: IconName;
        altTextClose?: string;
        status?: Status;
        chipType?: ChipType;
        children?: React.ReactNode;
    };
    export function Chip({ onClose, iconLeft, altTextClose, status, chipType, children }: ChipProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/autocomplete/chip-input" {
    import { IconName } from 'components/icon';
    type ChipInputProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: string[];
        valid?: boolean;
        leftIcon?: IconName;
        error?: string;
        meta?: string;
        placeholder?: string;
        required?: boolean;
        onInput?: (value: string) => void;
        separators: string[];
        inputType?: 'text' | 'email';
    };
    export const ChipInput: import("react").ForwardRefExoticComponent<ChipInputProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/autocomplete/chip-input-autocomplete" {
    import { IconName } from 'components/icon';
    import { Option } from 'types/options';
    type ChipInputAutocompleteProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: Option[];
        valid?: boolean;
        leftIcon?: IconName;
        arrow?: boolean;
        error?: string;
        meta?: string;
        multiple?: boolean;
        placeholder?: string;
        required?: boolean;
        options: Option[];
        onInput?: (value: string) => void;
        inputWrapperChildrenClasses?: string;
    };
    export const ChipInputAutocomplete: import("react").ForwardRefExoticComponent<ChipInputAutocompleteProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group/checkbox-group.types" {
    export interface CheckboxGroupOption {
        value: string;
        label: string;
        description?: string;
        disabled?: boolean;
    }
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group" {
    import { CheckboxGroupOption } from "sharedComponents/components/inputs/checkbox/checkbox-group/checkbox-group.types";
    interface CheckboxGroupProps {
        name: string;
        screenReaderHelpText?: string;
        options: CheckboxGroupOption[];
        value: string[];
        onChange: (checked: string[]) => void;
    }
    export function CheckboxGroup({ name, screenReaderHelpText, value, options, onChange }: CheckboxGroupProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group-card/checkbox-group-card.types" {
    import { ReactNode } from 'react';
    import { IconName } from 'components/icon';
    export type CheckboxVariant = 'circle' | 'square';
    type BaseOption = {
        description?: string;
        disabled?: boolean;
        label: string;
        value: string | number;
        icon?: IconName;
        render?: ReactNode;
    };
    export interface AdvancedOption<T> extends BaseOption {
        data?: T;
    }
    export type CheckboxGroupCardOption<T = void> = T extends void ? BaseOption : AdvancedOption<T>;
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group-card/checkbox-group-card" {
    import { ReactNode } from 'react';
    import { CheckboxGroupCardOption, CheckboxVariant } from "sharedComponents/components/inputs/checkbox/checkbox-group-card/checkbox-group-card.types";
    type CheckboxGroupCardProps = {
        label: string;
        labelHidden?: boolean;
        options: CheckboxGroupCardOption[];
        value: CheckboxGroupCardOption[];
        checkboxVariant?: CheckboxVariant;
        column?: boolean;
        bgOnSelect?: string;
        customLabel?: ReactNode;
        customDescription?: ReactNode;
        onChange?: (checked: boolean) => void;
        verticallyAligned?: boolean;
    };
    export const CheckboxGroupCard: import("react").ForwardRefExoticComponent<CheckboxGroupCardProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group-card" {
    export * from "sharedComponents/components/inputs/checkbox/checkbox-group-card/checkbox-group-card";
    export * from "sharedComponents/components/inputs/checkbox/checkbox-group-card/checkbox-group-card.types";
}
declare module "sharedComponents/components/inputs/checkbox/checkbox-group" {
    type CheckboxProps = {
        name: string;
        disabled?: boolean;
        checked?: boolean;
        label?: string;
        onChange: (checked: boolean) => void;
        onClick?: () => void;
    };
    export const Checkbox: import("react").ForwardRefExoticComponent<CheckboxProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/dropzone" {
    import type { FileRejectionsType, FileWithPath, HTMLInputEvent } from 'components/inputs/dropzone/dropzone.types';
    type DropzoneProps = {
        accept: string | string[];
        disabled?: boolean;
        maxSize?: number;
        minSize?: number;
        multiple?: boolean;
        preventDropOnDocument?: boolean;
        noClick?: boolean;
        noKeyboard?: boolean;
        noDrag?: boolean;
        name?: string;
        bigCloudIcon?: boolean;
        className?: string;
        onDragEnter?: (event: HTMLInputEvent) => void;
        onDragOver?: (event: HTMLInputEvent) => void;
        onDragLeave?: (event: HTMLInputEvent) => void;
        onDrop?: (acceptedFiles: FileWithPath[], rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
        onDropAccepted?: (acceptedFiles: FileWithPath[], event: HTMLInputEvent) => void;
        onDropRejected?: (rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
        onFileDialogCancel?: () => void;
    };
    export function Dropzone({ accept, disabled, maxSize, minSize, multiple, preventDropOnDocument, noClick, noKeyboard, noDrag, name, bigCloudIcon, className, onDragEnter, onDragOver, onDragLeave, onDrop, onDropAccepted, onDropRejected, onFileDialogCancel, }: DropzoneProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/email-field" {
    type EmailFieldProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: string;
        valid?: boolean;
        required?: boolean;
        error?: string;
        meta?: string;
        placeholder?: string;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
        onBlur?: React.FocusEventHandler<HTMLInputElement>;
    };
    export const EmailField: import("react").ForwardRefExoticComponent<EmailFieldProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/hidden-field" {
    import { RadioCardValue } from 'components/radio-card';
    type HiddenFieldProps = {
        value: RadioCardValue;
    };
    export function HiddenField({ value }: HiddenFieldProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/input" {
    import { HTMLInputTypeAttribute } from 'react';
    import { IconName } from 'components/icon';
    import { type AllowedChars } from 'utils/validators';
    export type InputProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value?: string;
        valid?: boolean;
        limit?: number;
        leftIcon?: IconName;
        rightIcon?: IconName;
        type?: HTMLInputTypeAttribute;
        suffix?: string;
        error?: string;
        meta?: string;
        placeholder?: string;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        caseInsensitivityMatch?: string;
        existingList?: string[];
        allowedChars?: AllowedChars[];
        canNotStartWith?: string[];
        validate?: (v: string) => string;
        errors?: string[] | undefined;
        fsExclude?: boolean;
        isSlim?: boolean;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
        onBlur?: React.FocusEventHandler<HTMLInputElement>;
    };
    export const Input: import("react").ForwardRefExoticComponent<InputProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/input-wrapper" {
    import { IconName } from 'components/icon';
    export type InputWrapperProps = {
        label: string;
        id: string;
        value: string;
        disabled?: boolean;
        readonly?: boolean;
        valid?: boolean;
        limit?: number;
        focused?: boolean;
        labelIcon?: IconName;
        rightIcon?: IconName;
        onRightIconClick?: () => void;
        error?: string;
        meta?: string;
        hideLabel?: boolean;
        suffix?: string;
        readOnlyElement?: React.ReactNode;
        children?: React.ReactNode;
        rightIconElement?: React.ReactNode;
        suffixElement?: React.ReactNode;
        metaElement?: React.ReactNode;
        limitElement?: React.ReactNode;
        isSlim?: boolean;
        fsExclude?: boolean;
        containerChildrenClasses?: string;
    };
    export function InputWrapper({ label, id, value, disabled, readonly, valid, limit, focused, labelIcon, rightIcon, onRightIconClick, error, meta, hideLabel, suffix, readOnlyElement, children, rightIconElement, suffixElement, metaElement, limitElement, isSlim, fsExclude, containerChildrenClasses, }: InputWrapperProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/multi-step-input/multi-step-input.types" {
    import { FieldValue, Option } from 'types/options';
    export type Context = 'primary' | 'secondary';
    export type MultiStepValue = {
        primary?: Option | null;
        secondary?: Option | null;
    };
    export type { FieldValue };
}
declare module "sharedComponents/components/inputs/multi-step-input/multi-step-input.utils" {
    import { MultiStepValue } from "sharedComponents/components/inputs/multi-step-input/multi-step-input.types";
    export function isMultiStepValue(value: unknown): value is MultiStepValue;
    export function toString(value: MultiStepValue): string;
    export function last(list?: MultiStepValue | MultiStepValue[] | null): MultiStepValue | undefined;
    export function isComplete(value?: MultiStepValue | null): boolean;
    export function hasValue(value: MultiStepValue | MultiStepValue[] | null): boolean;
    export function asList(value: MultiStepValue | MultiStepValue[] | null): MultiStepValue[];
    export function isListValue(value: MultiStepValue | MultiStepValue[] | null, multiple: boolean): value is MultiStepValue[];
}
declare module "sharedComponents/components/inputs/multi-step-input" {
    import { IconName } from 'components/icon';
    import { Option } from 'types/options';
    import { Context, MultiStepValue } from "sharedComponents/components/inputs/multi-step-input/multi-step-input.types";
    type MultiStepInputProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: MultiStepValue | MultiStepValue[] | null;
        valid?: boolean;
        leftIcon?: IconName;
        error?: string;
        meta?: string;
        multiple?: boolean;
        placeholder?: string;
        required?: boolean;
        primaryOptions: Option[] | null;
        primaryLabel: string;
        secondaryOptions: Option[] | null;
        secondaryLabel: string;
        onInput?: (context: Context, value: string) => void;
        onSelect?: (context: Context, value: MultiStepValue) => void;
        onClear?: () => void;
        setRequiredError?: (context: Context, formId: string) => void;
        id?: string;
        formId: string;
    };
    export const MultiStepInput: import("react").ForwardRefExoticComponent<MultiStepInputProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/native-date-time" {
    export type NativeDateTimeProps = {
        label: string;
        name: string;
        value?: string;
        min?: string;
        max?: string;
        required?: boolean;
        onChange?: (value: string) => void;
        onBlur?: React.FocusEventHandler<HTMLInputElement>;
    };
    export const NativeDateTime: import("react").ForwardRefExoticComponent<NativeDateTimeProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/number-field/number-field.utils" {
    export const numberDotMinusRegex: RegExp;
}
declare module "sharedComponents/components/inputs/number-field" {
    import { IconName } from 'components/icon';
    export type NumberFieldProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value?: string;
        valid?: boolean;
        leftIcon?: IconName;
        rightIcon?: IconName;
        onRightIcon?: () => void;
        native?: boolean;
        error?: string;
        errors?: string[];
        meta?: string;
        placeholder?: string;
        required?: boolean;
        min: number;
        max: number;
        step?: number;
        onChange?: (value: string) => void;
        suppressMeta?: boolean;
        variant?: 'default' | 'slim';
    };
    export const NumberField: import("react").ForwardRefExoticComponent<NumberFieldProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/password-field" {
    type PasswordFieldProps = {
        disabled?: boolean;
        label: string;
        name: string;
        readonly?: boolean;
        value: string;
        valid?: boolean;
        required?: boolean;
        autofill?: boolean;
        limit?: number;
        error?: string;
        meta?: string;
        placeholder?: string;
        confirmValue?: string;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
        onBlur?: React.FocusEventHandler<HTMLInputElement>;
    };
    export const PasswordField: import("react").ForwardRefExoticComponent<PasswordFieldProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/radio-card" {
    type RadioCardProps = {
        label?: string;
        labelElement?: React.ReactNode;
        description?: string;
        value: string;
        group: string;
        disabled?: boolean;
        onChange: (value: string) => void;
        children?: React.ReactNode;
    };
    export function RadioCard({ label, labelElement, description, value, group, disabled, onChange, children, }: RadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/radio-inputs/radio" {
    type RadioProps = {
        label: string;
        name: string;
        disabled?: boolean;
        description?: string;
        value: string | number;
        group: string | number;
        horizontal?: boolean;
        onChange: (checked: string | number) => void;
    };
    export const Radio: import("react").ForwardRefExoticComponent<RadioProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/radio-inputs/radio-group" {
    import { Option } from 'types/options';
    export type RadioGroupValue = string | number;
    type RadioGroupProps<T extends RadioGroupValue> = {
        name: string;
        title?: string;
        subtitle?: string;
        screenReaderHelpText?: string;
        value: T;
        options: Option<T>[];
        onChange: (value: T) => void;
        error?: string;
        horizontal?: boolean;
        disabled?: boolean;
    };
    export const RadioGroup: import("react").ForwardRefExoticComponent<RadioGroupProps<RadioGroupValue> & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/select/select.types" {
    import { IconName } from 'components/icon';
    import { Status } from 'components/inputs/autocomplete/chip/chip.types';
    export type SelectValue = string | number | boolean | null;
    export type SelectOption<T> = {
        label: string;
        value: T;
        description?: string;
        icon?: IconName;
        disabled?: boolean;
        group?: string;
    };
    export type SelectProps<T extends SelectValue | Array<SelectValue>> = {
        unknownOptionFallback?: string;
        icon?: IconName;
        disabled?: boolean;
        error?: string;
        meta?: string;
        loading?: boolean;
        slim?: boolean;
        label?: string;
        filtered?: boolean;
        labelLeft?: boolean;
        suppressMeta?: boolean;
        placeholder?: string;
        chipStatus?: Status;
        required?: boolean;
        options: Array<SelectOption<T extends Array<SelectValue> ? T[number] : T>>;
        value: T extends Array<SelectValue> ? T : T | null;
        className?: string;
        withPortal?: boolean;
        onChange: (value: T extends Array<SelectValue> ? T : T | null) => void;
        renderContent?: (hideMenuFn: () => void) => JSX.Element;
    } & ({
        freeform: true;
        submitEventKeys?: string[];
    } | {});
}
declare module "sharedComponents/components/inputs/select/select.utils" {
    import { SelectOption, SelectProps, SelectValue } from "sharedComponents/components/inputs/select/select.types";
    export function getOptionsByGroup<T>(options: SelectOption<T>[]): {
        [group: string]: SelectOption<T>[];
    };
    export function getFilteredOptionsByGroup<T>(optionsByGroup: {
        [group: string]: SelectOption<T>[];
    }, searchPhrase: string): {
        [k: string]: SelectOption<T>[];
    };
    export function getOptionsByValue<T>(options: SelectOption<T>[]): Map<T, SelectOption<T>>;
    export function getFreeformInputKeydownHandler<T>({ value, submitEventKeys, pickOption, removeOption, }: {
        value: T[];
        submitEventKeys: string[];
        pickOption: (value: T) => void;
        removeOption: (value: T) => void;
    }): (event: React.KeyboardEvent<HTMLInputElement>) => void;
    export function getWrapperKeydownHandler<T extends SelectValue | Array<SelectValue>, D = T extends Array<SelectValue> ? T[number] : T>({ disabled, hideMenu, referenceElement, filtered, menuVisible, props, options, removeOption, listElementRef, showMenu, toggleOption, filteredOptionsByGroup, }: {
        disabled?: boolean;
        hideMenu: () => void;
        referenceElement: HTMLElement | null;
        filtered: boolean;
        menuVisible: boolean;
        props: SelectProps<T>;
        options: SelectProps<T>['options'];
        removeOption: (value: D) => void;
        showMenu: () => void;
        listElementRef: {
            current: HTMLElement | null;
        };
        toggleOption: (value: SelectOption<D>) => void;
        filteredOptionsByGroup: {
            [group: string]: SelectOption<D>[];
        };
    }): (event: React.KeyboardEvent<HTMLInputElement>) => void;
}
declare module "sharedComponents/components/inputs/select" {
    import { SelectProps, SelectValue } from "sharedComponents/components/inputs/select/select.types";
    export function Select<T extends SelectValue | Array<SelectValue>>({ ...props }: SelectProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/text-field/text-field.types" {
    export type TextFieldType = 'email' | 'password' | 'tel' | 'text';
}
declare module "sharedComponents/components/inputs/text-field" {
    import { InputProps } from 'components/inputs/input';
    import { TextFieldType } from "sharedComponents/components/inputs/text-field/text-field.types";
    export interface TextFieldProps extends InputProps {
        type?: TextFieldType;
    }
    export const TextField: import("react").ForwardRefExoticComponent<TextFieldProps & import("react").RefAttributes<HTMLInputElement>>;
}
declare module "sharedComponents/components/inputs/textarea" {
    type TextAreaProps = {
        name?: string;
        value: string;
        placeholder?: string;
        label: string;
        id?: string;
        metaDescription?: string;
        disabled?: boolean;
        required?: boolean;
        error?: boolean;
        wrapperClassName?: string;
        inputClassName?: string;
        fsExclude?: boolean;
        onTextAreaDoubleClick?: () => void;
    } & ({
        readOnly: true;
    } | {
        readOnly?: false;
        onChange: (value: string) => void;
    });
    export const TextArea: import("react").ForwardRefExoticComponent<TextAreaProps & import("react").RefAttributes<HTMLTextAreaElement>>;
}
declare module "sharedComponents/components/inputs/time-fields/time-field/time-field.types" {
    export type Time = {
        hour?: number;
        minute?: number;
    };
}
declare module "sharedComponents/components/inputs/time-fields/time-field/time-field.utils" {
    export const regexTimeField: RegExp;
    export const partialTimeField: RegExp;
    export function zeroPadNumber(value?: number): string;
}
declare module "sharedComponents/components/inputs/time-fields/time-field" {
    import { Time } from "sharedComponents/components/inputs/time-fields/time-field/time-field.types";
    type TimeFieldProps = {
        value: Time | null;
        onChange: (value: Time | null) => void;
        label?: string;
        name?: string;
        placeholder?: string;
        disabled?: boolean;
        validate?: (value: string) => string;
    };
    export function TimeField({ value, label, name, placeholder, disabled, validate, onChange, }: TimeFieldProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/time-fields/time-window" {
    import { ManipulateType } from 'dayjs';
    type TimeWindowProps = {
        active: string;
        onChange: (value: string, manipulateType: string) => void;
    };
    export type MapRangeProps = {
        time: number;
        /** unit is a days js compliant unit to subtract from the current time */
        unit: ManipulateType;
        /** step is the amount of time that should be shown between 'ticks'
         * step will increase with the scale of the unit/time being used. This is
         * to ensure that chart data is helpful, for example when showing the past
         * seven days of data points, it wouldn't be helpful to show a data point every 30 seconds
         * so instead we show a data point every ~42 minutes.
         */
        step: number;
    };
    export function TimeWindow({ active, onChange }: TimeWindowProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/time-fields/timestamp-field" {
    type TimestampFieldProps = {
        value: Date | null;
        format?: string;
        label?: string;
        name?: string;
        placeholder?: string;
        onChange?: (value: Date | null) => void;
    };
    export function TimestampField({ value, format, label, name, placeholder, onChange, }: TimestampFieldProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/inputs/two-factor-auth" {
    type TwoFactorAuthProps = {
        loading?: boolean;
        onSuccess: (code: string) => void;
    };
    export type TwoFactorAuthHandle = {
        reset: () => void;
    };
    export const TwoFactorAuth: import("react").ForwardRefExoticComponent<TwoFactorAuthProps & import("react").RefAttributes<TwoFactorAuthHandle>>;
}
declare module "sharedComponents/components/insufficient-permissions" {
    type InsufficientPermissionsProps = {
        title?: string;
    };
    export function InsufficientPermissions({ title }: InsufficientPermissionsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/interstitial/learn-couchbase-interstitial" {
    import { Language } from 'constants/languages';
    import './static-code-theme-one-light.scss';
    type LearnCouchbaseInterstitialProps = {
        slideDurationInMs?: number;
        displayDelayInMs?: number;
        transitionDurationInMs?: number;
        languages: Language[];
    };
    export function LearnCouchbaseInterstitial({ slideDurationInMs, displayDelayInMs, transitionDurationInMs, languages, }: LearnCouchbaseInterstitialProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/linked-items" {
    import { type LinkedItem } from 'components/linked-items';
    type LinkedItemsProps = {
        items: LinkedItem[];
    };
    export function LinkedItems({ items }: LinkedItemsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/maintenance/change-schedule" {
    import { Time } from 'components/inputs/time-fields/time-field';
    export type ChangeScheduleProps = {
        time: Time;
        date: string;
        onChangeDate: (date: string) => void;
        onChangeTime: (time: Time) => void;
    };
    export function ChangeSchedule({ time, date, onChangeDate, onChangeTime }: ChangeScheduleProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/maintenance/permissions-job-panel" {
    export function PermissionsJobPanel(): import("react").JSX.Element;
}
declare module "sharedComponents/components/maintenance/running-maintenance-panel" {
    export function RunningMaintenancePanel(): import("react").JSX.Element;
}
declare module "sharedComponents/components/maintenance/schedule" {
    import { Time } from 'components/inputs/time-fields/time-field';
    import { MaintenanceJob } from 'sync/maintenance-job-service';
    import { PermissionRecord } from 'sync/response.types';
    import { ResourceType } from 'types/store';
    export interface ScheduleProps {
        time: Time;
        date: string;
        job: MaintenanceJob;
        permissions: PermissionRecord;
        hasRunningMaintenanceJobs: boolean;
        databaseId: string;
        organizationId: string;
        appServiceId: string;
        projectId: string;
        resourceName?: Omit<ResourceType, 'project' | 'popular' | 'history'>;
        onChangeDateHandle: (date: string) => void;
        onChangeTimeHandle: (time: Time) => void;
        editSchedule: (queueAt?: string) => void;
    }
    export function Schedule({ job, date, time, permissions, hasRunningMaintenanceJobs, resourceName, databaseId, organizationId, appServiceId, projectId, onChangeDateHandle, onChangeTimeHandle, editSchedule, }: ScheduleProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/menu/menu.types" {
    import { IconName } from 'components/icon';
    export type AnchorItem = {
        label: string;
        icon?: IconName;
        group?: string;
        href: string;
        disabled?: boolean;
        tooltip?: string;
        hide?: boolean;
    };
    export type ButtonItem = {
        label: string;
        icon?: IconName;
        group?: string;
        onClick: () => void;
        disabled?: boolean;
        tooltip?: string;
        hide?: boolean;
    };
    export type MenuItem = AnchorItem | ButtonItem;
    export type Menu = {
        items: MenuItem[];
    };
    export type Palette = 'default' | 'information';
}
declare module "sharedComponents/components/menu" {
    import { Placement } from '@popperjs/core';
    import { MenuItem, Palette } from "sharedComponents/components/menu/menu.types";
    type MenuProps = {
        label?: string;
        items: MenuItem[];
        palette?: Palette;
        id?: string;
        withPortal?: boolean;
        placement?: Placement;
        offset?: [number, number];
    };
    export function Menu({ label, items, palette, withPortal, placement, offset, }: MenuProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/navigate-with-query" {
    type NavigateWithQueryProps = {
        to: string;
    };
    export function NavigateWithQuery({ to }: NavigateWithQueryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/navigation/navigation.types" {
    import { IconName } from 'components/icon';
    export type NavLink = {
        href: string;
        label: string;
        icon: IconName;
        disabled?: boolean;
    };
    export type Section = {
        key: string;
        title?: string;
        links: NavLink[];
        disabled?: boolean;
        divider?: boolean;
    };
    export type Links = Section[];
}
declare module "sharedComponents/components/navigation" {
    import { Links } from "sharedComponents/components/navigation/navigation.types";
    export function Navigation({ end, links, variant }: {
        end?: boolean;
        links: Links;
        variant?: 'default' | 'wide';
    }): import("react").JSX.Element;
}
declare module "sharedComponents/components/notification" {
    /**
     * This component should display last notification for given page.
     */
    export function Notification(): any;
}
declare module "sharedComponents/components/organization-access-management-navigation" {
    type OrganizationAccessManagementNavigationProps = {
        peopleHref: string;
        teamsHref: string;
    };
    export function OrganizationAccessManagementNavigation({ peopleHref, teamsHref }: OrganizationAccessManagementNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-people/organization-people.utils" {
    import { OrganizationUser } from 'sync/organization-service';
    import { Team } from 'sync/team-service';
    export const getOrganizationPeopleData: (teamList: Team[], organizationUsers: OrganizationUser[]) => {
        teams: Team;
        userTeams: OrganizationUser;
        userProjects: OrganizationUser;
    };
}
declare module "sharedComponents/components/organization-people" {
    import { OrganizationUser } from 'sync/organization-service';
    import { Team } from 'sync/team-service';
    type OrganizationPeopleProps = {
        organizationUsers: OrganizationUser[];
        teams: Team[];
        organizationId: string;
        ssoFlag: boolean;
    };
    export function OrganizationPeople({ organizationUsers, organizationId, teams: teamList, ssoFlag }: OrganizationPeopleProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-settings/create-realm-default-team" {
    import { Option } from 'types/options';
    export type CreateRealmDefaultTeamProps = {
        teamId: string | null;
        teams: Option<string>[];
        onChangeHandler: (teamId: string | null) => void;
    };
    export function CreateRealmDefaultTeam({ teamId, teams, onChangeHandler }: CreateRealmDefaultTeamProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-settings/realm-vendors-radio-card" {
    import { RadioCardValue } from 'components/radio-card';
    type RealmVendorsRadioCardProps = {
        value: RadioCardValue | null;
        label?: string;
        labelHidden?: boolean;
        onChange: (value: RadioCardValue) => void;
    };
    export function RealmVendorsRadioCard({ value, labelHidden, label, onChange, }: RealmVendorsRadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-settings-navigation" {
    type OrganizationSettingsNavigationProps = {
        settingsHref: string;
        ssoHref: string;
        apiKeysHref: string;
        mfaHref: string;
        sessionExpirationHref: string;
        activityLogHref: string;
        paymentHref: string;
        usageHref: string;
    };
    export function OrganizationSettingsNavigation({ settingsHref, ssoHref, apiKeysHref, mfaHref, sessionExpirationHref, activityLogHref, paymentHref, usageHref, }: OrganizationSettingsNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-tab-navigation" {
    export function OrganizationTabNavigation(): import("react").JSX.Element;
}
declare module "sharedComponents/components/organization-teams" {
    import { Team } from 'sync/team-service';
    type OrganizationTeamsProps = {
        teams: Team[];
    };
    export function OrganizationTeams({ teams }: OrganizationTeamsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/page-container" {
    type PageContainerProps = {
        children: React.ReactNode;
    };
    export function PageContainer({ children }: PageContainerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/page-title" {
    import React from 'react';
    import { CtaProps } from 'components/cta';
    interface PageTitleProps {
        title: string;
        cta?: CtaProps;
        fsExclude?: boolean;
        hasChip?: boolean;
        hasButtonGroup?: boolean;
        chip?: React.ReactNode;
        buttonGroup?: React.ReactNode;
        children?: React.ReactNode;
    }
    export function PageTitle({ title, cta, fsExclude, hasButtonGroup, hasChip, chip, buttonGroup, children }: PageTitleProps): React.JSX.Element;
}
declare module "sharedComponents/components/password-validations" {
    export const evaluator: (password: string) => {
        isValid: any;
        criteria: {
            label: string;
            ok: any;
        }[];
    };
    export function PasswordValidations({ password }: {
        password: string;
    }): import("react").JSX.Element;
}
declare module "sharedComponents/components/pop/go-to-footer-cta" {
    import { ReactNode } from 'react';
    type GoToFooterCTAProps = {
        url?: string;
        children: ReactNode;
    };
    export function GoToFooterCTA({ url, children }: GoToFooterCTAProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/pop/pop-frame" {
    import { ReactNode } from 'react';
    type PopFrameProps = {
        headline?: string;
        tagline?: string;
        children: ReactNode;
        focalElement?: ReactNode;
        footerElement?: ReactNode;
    };
    export function PopFrame({ headline, tagline, children, focalElement, footerElement }: PopFrameProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/preloader" {
    export function Preloader(): import("react").JSX.Element;
}
declare module "sharedComponents/components/project/app-service/create-app-service/create-app-service.utils" {
    import { DatabaseProvider, DatabaseResponse } from 'sync/database-service';
    import { Option } from 'types/options';
    export const appServiceRegex: RegExp;
    export const validateAppServiceName: (formAppServiceName: string) => true | "can only contain letters, numbers, dashes, or empty spaces";
    export const filterDatabase: (databases: DatabaseResponse[]) => DatabaseResponse[];
    export const getDatabaseOptions: (databases: DatabaseResponse[]) => Option<string, DatabaseProvider>[];
    export const getComputes: (deploymentOptions?: AppServiceDeploymentOptions, providerName?: string) => any;
    export const getTotalCreditsPerHour: (selectedAppCost?: AppServiceDeploymentCost, selectedDatabaseCost?: DatabaseDeploymentCost) => string;
    export const getCompute: (selectedProvider?: DatabaseProvider) => "" | "c5.2xlarge" | "n2-custom-8-16384" | "Standard_F8s_v2";
    export const appServiceVersions: {
        label: string;
        value: string;
    }[];
}
declare module "sharedComponents/components/project/app-service/create-app-service" {
    import { SelectOption } from 'components/inputs/select';
    import { TrialDetails } from 'hooks/use-current-trial/use-current-trial.types';
    import { AppServiceDeploymentCostResponse } from 'sync/app-service-service';
    import { DatabaseDeploymentCostResponse } from 'sync/configuration-service';
    import { DatabaseProvider, DatabaseResponse } from 'sync/database-service';
    import { ProjectResponse } from 'sync/project-service';
    import { Option } from 'types/options';
    export type CreateAppServiceForm = {
        compute: string;
        node: number;
        database: string;
        appServiceName: string;
    };
    export type CreateAppServiceAppProps = {
        defaultValues: CreateAppServiceForm;
        databasesOptions: Option<string, DatabaseProvider>[];
        versionToggle: boolean;
        appServiceVersions: Option[];
        totalCreditsPerHour: string | null;
        nodes: SelectOption<number>[];
        computes: SelectOption<string>[];
        loading: boolean;
        trial?: TrialDetails;
        appServiceCosts?: AppServiceDeploymentCostResponse;
        databasesCosts?: DatabaseDeploymentCostResponse;
        selectedProvider?: DatabaseProvider;
        selectedDatabase?: DatabaseResponse;
        project?: ProjectResponse;
        addAppService: (formValues: CreateAppServiceForm) => void;
        onFormChange: (formValues: CreateAppServiceForm) => void;
    };
    export function CreateAppService({ defaultValues, databasesOptions, versionToggle, appServiceVersions, nodes, computes, selectedDatabase, totalCreditsPerHour, selectedProvider, databasesCosts, appServiceCosts, trial, loading, project, addAppService, onFormChange, }: CreateAppServiceAppProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/project-collaborators-list" {
    import { ProjectUser } from 'sync/project-service';
    type ProjectCollaboratorsListProps = {
        data: ProjectUser[];
        organizationId: string;
        projectId: string;
        ssoFlag: boolean;
    };
    export function ProjectCollaboratorsList({ data, organizationId, projectId, ssoFlag }: ProjectCollaboratorsListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/project-tab-navigation" {
    export function ProjectTabNavigation(): import("react").JSX.Element;
}
declare module "sharedComponents/components/provider-regions-radio-card" {
    import { RadioCardOption } from 'components/radio-card';
    import { Provider } from 'constants/provider';
    import { ProviderRegion } from 'constants/provider-region';
    type ProviderRegionsRadioCardProps = {
        provider?: Provider;
        value?: ProviderRegion;
        labelHidden?: boolean;
        label?: string;
        optionsByProvider?: Record<Provider, RadioCardOption[]>;
        onChange: (value: ProviderRegion) => void;
    };
    export function ProviderRegionsRadioCard({ provider, value, labelHidden, label, optionsByProvider, onChange, }: ProviderRegionsRadioCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/providers/fetch/fetch.types" {
    import { UseQueryResult } from '@tanstack/react-query';
    export type FetchQuery = Pick<UseQueryResult<unknown, unknown>, 'isLoading' | 'error' | 'data' | 'isSuccess'>;
}
declare module "sharedComponents/components/providers/fetch" {
    import { FetchQuery } from "sharedComponents/components/providers/fetch/fetch.types";
    export type FetchProps = {
        query: FetchQuery;
        hideSpinner?: boolean;
        catchError?: boolean;
        children?: React.ReactNode;
    };
    export function Fetch({ query, hideSpinner, catchError, children }: FetchProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/providers/page-error/page-error.constants" {
    export const INSUFFICIENT_PERMISSIONS_CODES: number[];
    export const DEFAULT_ERROR_MESSAGE = "Oops! Something went wrong!";
}
declare module "sharedComponents/components/providers/page-error/page-error.utils" {
    export const isErrorNetworkGoof: (error: unknown) => error is NetworkGoof;
    export const getErrorMessage: (error: unknown) => string;
}
declare module "sharedComponents/components/providers/page-error" {
    type PageErrorProps = {
        error: unknown;
        action?: () => void;
        actionLabel?: string;
    };
    export function PageError({ error, action, actionLabel }: PageErrorProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/query-results" {
    type QueryResultsProps = {
        queryResults?: Record<string, unknown>[];
    };
    export function QueryResults({ queryResults }: QueryResultsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/radio-card/radio-card.types" {
    export type RadioCardValue = string | number | boolean;
    type BaseOption = {
        description?: string;
        disabled?: boolean;
        label: string;
        value: RadioCardValue;
        alignCenter?: boolean;
        customPadding?: string;
        linkText?: string;
        linkHref?: string;
        render?: React.ReactNode;
        handleMessage?: (e: CustomEvent) => void;
    };
    interface AdvancedOption<T> extends BaseOption {
        data?: T;
    }
    export type RadioCardOption<T = void> = T extends void ? BaseOption : AdvancedOption<T>;
}
declare module "sharedComponents/components/radio-card" {
    import { RadioCardOption, RadioCardValue } from "sharedComponents/components/radio-card/radio-card.types";
    type RadioCardProps<T> = {
        label: string;
        labelHidden?: boolean;
        options: RadioCardOption<T>[];
        labelRenderer?: (option: RadioCardOption<T>) => React.ReactNode;
        value: RadioCardValue;
        onChange: (value: RadioCardValue) => void;
        column?: boolean;
        bgOnSelect?: string;
        children?: React.ReactNode;
    };
    export function RadioCard<T>({ label, labelHidden, options, value, column, bgOnSelect, labelRenderer, children, onChange, }: RadioCardProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/resource-deleting" {
    export function ResourceDeleting(): import("react").JSX.Element;
}
declare module "sharedComponents/components/restore-default-dialog" {
    type RestoreDefaultDialogProps = {
        onClose: () => void;
        onConfirm: () => void;
        show: boolean;
    };
    export function RestoreDefaultDialog({ onClose, show, onConfirm }: RestoreDefaultDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/resync-dialog" {
    type ResyncDialogProps = {
        documentationLink: string;
        show: boolean;
        onCancel: () => void;
        onConfirm: () => void;
    };
    export function ResyncDialog({ documentationLink, show, onConfirm, onCancel }: ResyncDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/resync-stopped-dialog" {
    type ResyncStoppedDialogProps = {
        show: boolean;
        onClose: () => void;
    };
    export function ResyncStoppedDialog({ show, onClose }: ResyncStoppedDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/empty-query" {
    import { SearchResult } from 'types/store';
    type EmptyQueryProps = {
        onRecentSearchTermClick: (term: string) => void;
        results: SearchResult[];
    };
    export function EmptyQuery({ results, onRecentSearchTermClick }: EmptyQueryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/no-result" {
    export function NoResult(): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/popular-entry" {
    import type { SearchResult } from 'types/store';
    type PopularEntryProps = {
        result: SearchResult;
        isFirst?: boolean;
        isLast?: boolean;
    };
    export function PopularEntry({ result, isFirst, isLast }: PopularEntryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/recent-query" {
    import { SearchResult } from 'types/store';
    type RecentQueryProps = {
        onRecentSearchTermClick: (term: string) => void;
        results: SearchResult;
    };
    export function RecentQuery({ onRecentSearchTermClick, results }: RecentQueryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/result-card" {
    import { SearchResult } from 'types/store';
    type ResultCardProps = {
        results: SearchResult[];
    };
    export function ResultCard({ results }: ResultCardProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/result-entry" {
    import { SearchResult } from 'types/store';
    type ResultEntryProps = {
        result: SearchResult;
    };
    export function ResultEntry({ result }: ResultEntryProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/search-hero/search-hero" {
    import { SearchResult } from 'types/store';
    type SearchHeroProps = {
        getSearchResults: (term: string) => SearchResult[];
        saveResult: (term: string) => void;
    };
    export function SearchHero({ getSearchResults, saveResult }: SearchHeroProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/session-expiration/session-expiration.utils" {
    import { Option } from 'types/options';
    export const sessionDurationOptions: Option<string>[];
}
declare module "sharedComponents/components/session-expiration" {
    type SessionExpirationForm = {
        sessionDuration: string | null;
    };
    type SessionExpirationProps = {
        onSubmitHandler: (values: SessionExpirationForm) => void;
        permissionsAccessible: {
            read: boolean;
            update: boolean;
        };
        sessionDuration: number;
        value: string | null;
        isLoading?: boolean;
    };
    export function SessionExpiration({ permissionsAccessible, onSubmitHandler, sessionDuration, value, isLoading }: SessionExpirationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/api-key-create" {
    import { OrganizationApiKey } from 'sync/access-service';
    export type ApiKeyCreateForm = {
        name: string;
    };
    type ApiKeyCreateProps = {
        apiKey: OrganizationApiKey | undefined;
        onSubmit: (values: ApiKeyCreateForm) => void;
        goToList: () => void;
        onDownload: (apiKey: OrganizationApiKey) => void;
    };
    export function ApiKeyCreate({ apiKey, onSubmit, goToList, onDownload }: ApiKeyCreateProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/api-keys" {
    import { CtaProps } from 'components/cta';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { OrganizationApiKey } from 'sync/access-service';
    import { PaginationParams } from 'sync/request.types';
    interface ApiKeysProps {
        apiKeys: OrganizationApiKey[];
        getCtaProps: (id: string) => CtaProps;
        totalItems: number;
        onPaginationChanged: (page: number, paginationSize: PaginationSize) => void;
        paginationDetails: PaginationParams;
    }
    export function ApiKeys({ apiKeys, getCtaProps, totalItems, onPaginationChanged, paginationDetails }: ApiKeysProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/multi-factor-authentication-list" {
    import type { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { OrganizationUser } from 'sync/organization-service';
    import { PaginationParams, SortParams } from 'sync/request.types';
    type MultiFactorAuthenticationListProps = {
        data: OrganizationUser[];
        organizationId: string;
        totalItems: number;
        sortDetails: SortParams;
        onPaginationChanged: (page: number, perPage: PaginationSize) => void;
        paginationDetails: PaginationParams;
        onSortChange: (sortModel: DataGridSortModel) => void;
    };
    export function MultiFactorAuthenticationList({ data, organizationId, totalItems, sortDetails, onPaginationChanged, paginationDetails, onSortChange, }: MultiFactorAuthenticationListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/organizations" {
    import { Organization } from 'sync/organization-service';
    import type { PermissionRecord } from 'sync/response.types';
    type OrganizationSettingsData = {
        orgName: string;
    };
    type OrganizationsSettingsProps = {
        organization: Organization;
        permissions: PermissionRecord;
        trialEnabled: boolean;
        defaultValue: OrganizationSettingsData;
        termsOfServiceHref: string;
        raiseSupportTicketHref: string;
        isLoading: boolean;
        createdBy?: string;
        createdAt?: string;
        submitUpdateOrganization: (data: OrganizationSettingsData) => void;
    };
    export function OrganizationsSettings({ organization, trialEnabled, permissions, defaultValue, createdBy, createdAt, raiseSupportTicketHref, termsOfServiceHref, isLoading, submitUpdateOrganization: updateOrganization, }: OrganizationsSettingsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/realm-group-mapping" {
    import { ToggleValue } from 'components/toggle';
    type RealmGroupMappingProps = {
        value: ToggleValue;
        onChange: (value: ToggleValue) => void;
    };
    export function RealmGroupMapping({ value, onChange }: RealmGroupMappingProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/realm-saml-signing-certificate" {
    type RealmSamlSigningCertificateProps = {
        value: string;
        onChange: (value: string) => void;
    };
    export function RealmSamlSigningCertificate({ value, onChange }: RealmSamlSigningCertificateProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/realm-sign-in-endpoint" {
    type RealmSignInEndpointProps = {
        value: string;
        onChange: (value: string) => void;
    };
    export function RealmSignInEndpoint({ value, onChange }: RealmSignInEndpointProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/settings/sso-list" {
    import { Realm } from 'sync/realm-service';
    type SSOListProps = {
        data: Realm[];
        organizationId: string;
        getNameLink: (organizationId: string, realmId: string) => string;
    };
    export function SSOList({ data: realmList, organizationId, getNameLink }: SSOListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/side-nav/side-nav.types" {
    import { IconName } from 'components/icon';
    export type NavLink = {
        href: string;
        label: string;
        icon: IconName;
    };
}
declare module "sharedComponents/components/side-nav" {
    import { NavLink } from "sharedComponents/components/side-nav/side-nav.types";
    export type SideNavProps = {
        links: NavLink[];
        pathname: string;
    };
    export function SideNav({ links, pathname }: SideNavProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/skip-link" {
    type SkipLinkProps = {
        text?: string;
        elementId?: string;
        onClick?: () => void;
    };
    export function SkipLink({ text, elementId, onClick }: SkipLinkProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/spinner/spinner.types" {
    export type SpinnerSize = 'select' | 'button' | 'small' | 'default' | 'large';
}
declare module "sharedComponents/components/spinner" {
    import { SpinnerSize } from "sharedComponents/components/spinner/spinner.types";
    type SpinnerProps = {
        size?: SpinnerSize;
        centered?: boolean;
    };
    export function Spinner({ size, centered }: SpinnerProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/split-view/side-view/side-view.constants" {
    export const HANDLE_WIDTH = "0.5rem";
    export const MIN_WIDTH = 12;
}
declare module "sharedComponents/components/split-view/side-view/side-view.types" {
    export type SideViewSize = number | null;
    export type SideViewDirection = 'left' | 'right';
    export type SideViewStorageKey = 'size' | 'open';
    export type SideViewProps = {
        id: string;
        direction: SideViewDirection;
        children: React.ReactNode;
        opened: boolean;
        onChange: (state: boolean) => void;
    };
}
declare module "sharedComponents/components/split-view/side-view/side-view.utils" {
    import { SideViewDirection, SideViewStorageKey } from "sharedComponents/components/split-view/side-view/side-view.types";
    export const getStorageKeyById: (id: string, direction: SideViewDirection, target: SideViewStorageKey) => string;
    export const getTogglerIconName: (opened: boolean, direction: SideViewDirection) => IconName;
}
declare module "sharedComponents/components/split-view/side-view" {
    import { SideViewDirection } from "sharedComponents/components/split-view/side-view/side-view.types";
    type SideViewProps = {
        id: string;
        direction: SideViewDirection;
        children: React.ReactNode;
        opened: boolean;
        onChange: (state: boolean) => void;
    };
    export function SideView({ direction, children, opened, onChange, id }: SideViewProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/split-view/side-view-arrow" {
    import { IconName } from 'components/icon';
    type SideViewArrowProps = {
        togglerIcon: IconName;
        opened: boolean;
        onChange: (state: boolean) => void;
        resizableRef: React.MutableRefObject<HTMLElement | null>;
        contentWidth: number;
        onExpand: () => void;
        updateWidth: (value: number | null) => void;
    };
    export function SideViewArrow({ resizableRef, togglerIcon, opened, onChange, contentWidth, onExpand, updateWidth }: SideViewArrowProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/split-view/split-view/split-view.constants" {
    export const DEFAULT_OPEN_VALUE = false;
}
declare module "sharedComponents/components/split-view/split-view/split-view.utils" {
    export const isBoolean: (value: unknown) => value is boolean;
}
declare module "sharedComponents/components/split-view/split-view" {
    type SplitViewProps = {
        leftSideRenderer?: () => React.ReactNode;
        rightSideRenderer?: () => React.ReactNode;
        children?: React.ReactNode;
        className?: string;
        id: string;
    };
    export function SplitView({ id, leftSideRenderer, rightSideRenderer, children, className }: SplitViewProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/status-icon" {
    import { Emphasis, Status } from 'components/status-icon/status-icon.types';
    type StatusIconProps = {
        emphasis?: Emphasis;
        label?: string;
        status?: Status;
        size?: 'default' | 'small';
        tooltipMessage?: string;
        className?: string;
    };
    export function StatusIcon({ label, tooltipMessage, size, emphasis, status, className, }: StatusIconProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/stop-resync-dialog" {
    type StopResyncDialogProps = {
        show: boolean;
        onClose: () => void;
        onConfirm: () => void;
        numberOfCollection: number;
    };
    export function StopResyncDialog({ show, onClose, onConfirm, numberOfCollection }: StopResyncDialogProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/storybook-provider" {
    export const StorybookProvider: any;
}
declare module "sharedComponents/components/support-list/support-list.utils" {
    export const getPriorityStatus: (priority: SupportPriority) => "warning" | "info" | "error" | "notice";
}
declare module "sharedComponents/components/support-list" {
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { PaginationParams, SortParams } from 'sync/request.types';
    import { Support } from 'sync/support-service';
    type SupportListProps = {
        data: Support[];
        totalItems: number;
        paginationDetails: PaginationParams;
        sortDetails: SortParams;
        createLink: (ticketId: string, externalId: number) => string;
        onSortChange: ({ field, order }: DataGridSortModel) => void;
        onPaginationChanged: (page: number, paginationSize: PaginationSize) => void;
    };
    export function SupportList({ data, totalItems, paginationDetails, sortDetails: { sortBy, sortDirection }, createLink, onSortChange, onPaginationChanged, }: SupportListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/support-ticket-form/support-ticket-form.types" {
    export type Option = {
        label: string;
        value: string;
    };
}
declare module "sharedComponents/components/support-ticket-form/support-ticket-form.utils" {
    import { PriorityLevel } from 'constants/support';
    import { Option } from "sharedComponents/components/support-ticket-form/support-ticket-form.types";
    export function getChipStatus(impactPriority: PriorityLevel): "warning" | "info" | "error" | "notice";
    export const sdkOptions: Option[];
    export const sdkOptionsObject: {
        [key: string]: string;
    };
}
declare module "sharedComponents/components/support-ticket-form" {
    import { SupportTicketForm as SupportFormType } from 'sync/support-service';
    import { Option } from "sharedComponents/components/support-ticket-form/support-ticket-form.types";
    export type SupportTicketFormProps = {
        form: SupportFormType;
        files: File[];
        onFileChange: (files: File[]) => void;
        displayFileList?: boolean;
        downloadFile?: boolean;
        projectOptions: Option[];
        databaseOptions: Option[];
        submitLabel?: string;
        edit?: boolean;
        readonly?: boolean;
        requiredFields?: string[];
        onSubmit: (values: SupportFormType) => void;
        onCancel: () => void;
    };
    export function SupportTicketForm({ onSubmit, onCancel, form, files, onFileChange, displayFileList, downloadFile, projectOptions, databaseOptions, submitLabel, edit, readonly, requiredFields, }: SupportTicketFormProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/tab-bar/tab-bar-item/tab-bar-item.types" {
    import { IconName } from 'components/icon';
    type CommonTabBarItem = {
        icon?: IconName;
        label: string;
    };
    export type TabBarLinkItem = CommonTabBarItem & {
        href: string;
    };
    export type TabBarButtonItem = CommonTabBarItem & {
        onClick: () => void;
    };
    export type TabBarListItem = TabBarLinkItem | TabBarButtonItem;
    export type TabBarItemVariant = 'default' | 'slim';
}
declare module "sharedComponents/components/tab-bar/tab-bar-item" {
    import { TabBarItemVariant, TabBarListItem } from "sharedComponents/components/tab-bar/tab-bar-item/tab-bar-item.types";
    export type TabBarItemProps = TabBarListItem & {
        selected: boolean;
        variant: TabBarItemVariant;
    };
    export function TabBarItem({ label, icon, selected, variant, ...props }: TabBarItemProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/tab-bar/tab-bar-menu/tab-bar-menu.types" {
    import { TabBarButtonItem, TabBarLinkItem } from 'components/tab-bar/tab-bar-item';
    export type TabMenuVariant = 'slim' | 'default';
    export type TabBarMenuProps<T extends string> = {
        className?: string;
        variant?: TabMenuVariant;
    } & ({
        value: T;
        onChange: (value: T) => void;
        items: (Omit<TabBarButtonItem, 'onClick'> & {
            key: T;
        })[];
    } | {
        items: (TabBarLinkItem & {
            key: T;
        })[];
    });
}
declare module "sharedComponents/components/tab-bar/tab-bar-menu/tab-bar-menu.utils" {
    import { TabBarMenuProps, TabMenuVariant } from "sharedComponents/components/tab-bar/tab-bar-menu/tab-bar-menu.types";
    export function getItemStatusByKey<T extends string>({ props, pathname }: {
        props: TabBarMenuProps<T>;
        pathname: string;
    }): { [key in T]: boolean; };
    export function getActiveItemKey<T extends string>(itemStatusByKey: ReturnType<typeof getItemStatusByKey>): T;
    export function getTabBarItemProps<T extends string>({ props, itemStatusByKey, variant, }: {
        props: TabBarMenuProps<T>;
        itemStatusByKey: ReturnType<typeof getItemStatusByKey>;
        variant: TabMenuVariant;
    }): any[];
}
declare module "sharedComponents/components/tab-bar/tab-bar-menu" {
    import { TabBarMenuProps } from "sharedComponents/components/tab-bar/tab-bar-menu/tab-bar-menu.types";
    export function TabBarMenu<T extends string>(props: TabBarMenuProps<T>): import("react").JSX.Element;
}
declare module "sharedComponents/components/toggle" {
    import { Option } from 'types/options';
    export type ToggleValue = string | number | boolean;
    export type ToggleProps<T extends ToggleValue> = {
        value?: T;
        options: Option[];
        altText?: string;
        disabled?: boolean;
        onChange?: (value: T) => void;
        children?: React.ReactNode;
    };
    export const toggleStyle: (isSelected: boolean, disabled: boolean) => string;
    export function Toggle({ disabled, options, onChange, value, altText, children }: ToggleProps<ToggleValue>): import("react").JSX.Element;
}
declare module "sharedComponents/components/tooltip" {
    import { TriggerType } from 'react-popper-tooltip';
    import { Placement, PositioningStrategy } from '@popperjs/core';
    type TooltipProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        renderContent: () => React.ReactNode;
        strategy?: PositioningStrategy;
        placement?: Placement;
        trigger?: TriggerType;
        dark?: boolean;
        withPortal?: boolean;
    };
    export function Tooltip({ placement, strategy, trigger, dark, renderContent, withPortal, ...props }: TooltipProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-avatar/user-avatar.types" {
    export type Size = 'small' | 'default';
}
declare module "sharedComponents/components/user-avatar" {
    import { Size } from "sharedComponents/components/user-avatar/user-avatar.types";
    type UserAvatarProps = {
        label: string;
        image?: string;
        size?: Size;
    };
    export function getInitials(name: string): string;
    export function UserAvatar({ label, image, size }: UserAvatarProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/activity/activity-filters" {
    import { EventListScope } from 'types/events';
    import { Option } from 'types/options';
    type SelectFields = 'actor' | 'database' | 'project' | 'severity' | 'tag';
    export type ActivityFiltersValue = {
        [key in SelectFields]: string | null;
    } & {
        dateFrom: string | null;
        dateTo: string | null;
    };
    export type ActivityFiltersProps = {
        resourceName: EventListScope;
        optionsByField: {
            [key in SelectFields]: Option<string>[];
        };
        value: ActivityFiltersValue;
        onChange: (value: ActivityFiltersValue) => void;
    };
    export function ActivityFilters({ resourceName, optionsByField, value, onChange }: ActivityFiltersProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/activity/activity-grid" {
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { EventResponse } from 'sync/event-service';
    import { PaginationParams, SortParams } from 'sync/request.types';
    import { EventListScope } from 'utils/events';
    export type ActivityGridProps = {
        sortDetails: SortParams;
        onPaginationChanged: (page: number, perPage: PaginationSize) => void;
        paginationDetails: PaginationParams;
        totalItems: number;
        data: EventResponse[];
        onSortChange: (sortModel: DataGridSortModel) => void;
        createLinkOptions: {
            organizationId: string;
            projectId: string;
            databaseId: string;
            userId: string;
        };
        resourceName: EventListScope;
    };
    export function ActivityGrid({ data, onSortChange, onPaginationChanged, paginationDetails: { perPage, page }, totalItems, createLinkOptions, resourceName, sortDetails: { sortBy, sortDirection }, }: ActivityGridProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/activity/activity-filters" {
    import { FetchQuery } from 'components/providers/fetch/fetch.types';
    import { ActivityFiltersProps } from "sharedComponents/components/user-settings/activity/activity-filters";
    import { ActivityGridProps } from "sharedComponents/components/user-settings/activity/activity-grid";
    export type ActivityProps = ActivityFiltersProps & ActivityGridProps & {
        query: FetchQuery;
    };
    export function Activity({ resourceName, optionsByField, value, onChange, sortDetails, data, query, onSortChange, createLinkOptions, onPaginationChanged, paginationDetails, totalItems, }: ActivityProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/change-password" {
    export type ChangePasswordFormData = {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    type ChangePasswordProps = {
        onSubmit: (values: ChangePasswordFormData) => void;
        initialState?: ChangePasswordFormData;
    };
    export function ChangePassword({ initialState, onSubmit }: ChangePasswordProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/default-organization-project" {
    import { Option } from 'types/options';
    type DefaultOrganizationProjectProps = {
        defaultValue: {
            defaultOrganization?: string;
            defaultProject?: string;
        };
        onSubmit: () => void;
        organizationOptions: Option<string>[];
        projectOptions: Option<string>[];
    };
    export function DefaultOrganizationProject({ defaultValue, onSubmit, organizationOptions, projectOptions, }: DefaultOrganizationProjectProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/mfa" {
    import { TwoFactorAuthHandle } from 'components/inputs/two-factor-auth';
    type MfaProps = {
        isMfaEnabled: boolean;
        isUserWithSSO: boolean;
        isQrVisible: boolean;
        isEnableDialogVisible: boolean;
        isDisableDialogVisible: boolean;
        qrCode: string;
        error: string;
        twoFactorAuthRef: React.MutableRefObject<TwoFactorAuthHandle | null>;
        fetchQrCode: () => Promise<void>;
        onSuccess: (code: string) => Promise<void>;
        handleFormSubmit: (event: React.FormEvent<Element>) => void;
        onConfirmEnabledMfa: () => void;
        onConfirmDisableMfa: () => Promise<void>;
        onCancelDisableMfa: () => void;
    };
    export function Mfa({ isMfaEnabled, isUserWithSSO, isQrVisible, isEnableDialogVisible, isDisableDialogVisible, qrCode, error, twoFactorAuthRef, fetchQrCode, onSuccess, handleFormSubmit, onConfirmEnabledMfa, onConfirmDisableMfa, onCancelDisableMfa, }: MfaProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/navigation" {
    type SettingsNavigationProps = {
        generalHref: string;
        invitationsHref: string;
        organizationsHref: string;
        activityHref: string;
    };
    export function SettingsNavigation({ generalHref, invitationsHref, organizationsHref, activityHref }: SettingsNavigationProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/notifications" {
    type NotificationsProps = {
        onSubmit: (values: NotificationFormProps) => void;
        checked: boolean;
    };
    export type NotificationFormProps = {
        enabled: boolean;
    };
    export function Notifications({ onSubmit, checked }: NotificationsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/profile" {
    import { User } from 'sync/user-service';
    export type FormProps = {
        name: string;
    };
    type UserProfileProps = {
        user: User;
        onSubmit: (values: FormProps) => void;
    };
    export function UserProfile({ user, onSubmit }: UserProfileProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/resources/invitations" {
    import { DataGridProps } from 'components/data-grid';
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { UserInvitationList } from 'sync/user-service';
    type InvitationsProps = {
        invitations: UserInvitationList;
        totalItems: number;
        perPage: PaginationSize;
        onSortChange: (sortModel: DataGridSortModel) => void;
        onPaginationChanged: DataGridProps<UserInvitationList>['onPaginationChanged'];
        onAcceptInvitation: (invitationId: string) => void;
        onDeclineInvitation: (invitationId: string) => void;
    };
    export function Invitations({ totalItems, invitations, perPage, onPaginationChanged, onSortChange, onAcceptInvitation, onDeclineInvitation, }: InvitationsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/resources" {
    import { DataGridProps } from 'components/data-grid';
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { OrganizationResponse } from 'sync/organization-service';
    type OrganizationsProps = {
        organizations: OrganizationResponse[];
        perPage: PaginationSize;
        totalItems: number;
        onPaginationChanged: DataGridProps<OrganizationResponse>['onPaginationChanged'];
        onSortChange: (sortModel: DataGridSortModel) => void;
    };
    export function Organizations({ organizations, perPage, onPaginationChanged, totalItems, onSortChange }: OrganizationsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/user-settings/time-region-form/time-region-form.utils" {
    export const REGION_OPTIONS: any;
    export const TIMEZONE_OPTIONS: any;
}
declare module "sharedComponents/components/user-settings/time-region-form" {
    import { User } from 'sync/user-service';
    export type RegionData = NonNullable<User['preferences']['region']>;
    type TimeRegionFormProps = {
        defaultValue: RegionData;
        onSubmit: (data: RegionData) => void;
    };
    export function TimeRegionForm({ defaultValue, onSubmit }: TimeRegionFormProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/users-list/users-list.utils" {
    import { OrganizationRole } from 'constants/roles';
    export const formatRoles: (rolesToFormat: OrganizationRole[]) => {
        content: any;
        key: any;
    }[];
}
declare module "sharedComponents/components/users-list" {
    import { DataGridProps } from 'components/data-grid';
    import { DataGridSortModel } from 'components/data-grid/data-grid.types';
    import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';
    import { OrganizationUser } from 'sync/organization-service';
    type UsersListProps = {
        users: OrganizationUser[];
        onSortChange: (sortModel: DataGridSortModel) => void;
        perPage: PaginationSize;
        onPaginationChanged: DataGridProps<OrganizationUser>['onPaginationChanged'];
        totalItems: number;
    };
    export function UsersList({ users, onSortChange, perPage, onPaginationChanged, totalItems }: UsersListProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/workbench/query-editor/query-editor.types" {
    import type { CSSDimension, OnRunHandler } from 'components/editor/editor.types';
    import type { DateTimeType } from 'utils/datetime/datetime.types';
    interface Collection {
        name: string;
        id: string;
    }
    interface Scope {
        name: string;
        id: string;
        collections?: Collection[];
    }
    interface Bucket {
        name: string;
        id: string;
        scopes?: Scope[];
    }
    export interface DatabaseSchema {
        buckets: Bucket[];
    }
    export type QueryStatus = 'success' | 'fatal';
    export interface QueryEditorProps {
        query: string;
        databaseSchema?: DatabaseSchema | Promise<DatabaseSchema>;
        onRun: OnRunHandler;
        runLabel?: string;
        queryStatus: QueryStatus;
        lastExecuted?: DateTimeType;
        executionTime?: string;
        numDocs?: number;
        height?: CSSDimension;
    }
}
declare module "sharedComponents/components/workbench/query-editor/query-editor.utils" {
    import type { DatabaseSchema } from "sharedComponents/components/workbench/query-editor/query-editor.types";
    export const generateSchemaDoc: (schemaIn: DatabaseSchema | Promise<DatabaseSchema> | undefined) => SchemaDoc;
}
declare module "sharedComponents/components/workbench/query-editor/query-stats/query-stats.types" {
    import type { QueryStatus } from 'components/workbench/query-editor/query-editor.types';
    import type { DateTimeType } from 'utils/datetime/datetime.types';
    export interface QueryStatsProps {
        queryStatus: QueryStatus;
        lastExecuted?: DateTimeType;
        executionTime?: string;
        numDocs?: number;
        className?: string;
    }
}
declare module "sharedComponents/components/workbench/query-editor/query-stats" {
    import type { QueryStatsProps } from "sharedComponents/components/workbench/query-editor/query-stats/query-stats.types";
    export function QueryStats({ queryStatus, lastExecuted, executionTime, numDocs, className }: QueryStatsProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/workbench/query-editor/query-stats/index" {
    export * from "sharedComponents/components/workbench/query-editor/query-stats";
}
declare module "sharedComponents/components/workbench/query-editor/schema-dropdown/schema-dropdown.types" {
    import React from 'react';
    import type { DatabaseSchema } from 'components/workbench/query-editor/query-editor.types';
    import type { SelectionLevel } from 'components/workbench/query-editor/schema-selector/schema-selector.types';
    export interface SchemaDropdownProps {
        databaseSchema: DatabaseSchema | Promise<DatabaseSchema>;
        queryContext: string | null;
        setQueryContext: React.Dispatch<React.SetStateAction<string | null>>;
        label?: string;
        placeholder?: string;
        selectionLevel: SelectionLevel;
    }
}
declare module "sharedComponents/components/workbench/query-editor/schema-dropdown" {
    import React from 'react';
    import type { SchemaDropdownProps } from "sharedComponents/components/workbench/query-editor/schema-dropdown/schema-dropdown.types";
    export function SchemaDropdown({ databaseSchema, queryContext, setQueryContext, label, placeholder, selectionLevel, }: SchemaDropdownProps): React.JSX.Element;
}
declare module "sharedComponents/components/workbench/query-editor/schema-dropdown/index" {
    export * from "sharedComponents/components/workbench/query-editor/schema-dropdown";
}
declare module "sharedComponents/components/workbench/query-editor" {
    import type { QueryEditorProps } from "sharedComponents/components/workbench/query-editor/query-editor.types";
    export function QueryEditor({ query, databaseSchema, onRun, runLabel, queryStatus, lastExecuted, executionTime, numDocs, height, }: QueryEditorProps): import("react").JSX.Element;
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector/schema-row/schema-row.types" {
    import React, { MouseEventHandler } from 'react';
    export interface SchemaRowProps {
        label: string;
        children?: React.ReactNode;
        className?: string;
        onClick?: MouseEventHandler<HTMLDivElement>;
        selected: boolean;
        clickable: boolean;
    }
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector/schema-row" {
    import React from 'react';
    import type { SchemaRowProps } from "sharedComponents/components/workbench/query-editor/schema-selector/schema-row/schema-row.types";
    export function SchemaRow({ label, children, className, onClick, selected, clickable }: SchemaRowProps): React.JSX.Element;
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector/schema-row/index" {
    export * from "sharedComponents/components/workbench/query-editor/schema-selector/schema-row";
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector/schema-selector.types" {
    import type { DatabaseSchema } from 'components/workbench/query-editor/query-editor.types';
    export interface SchemaSelectorProps {
        databaseSchema?: DatabaseSchema | Promise<DatabaseSchema>;
        selectionLevel: SelectionLevel;
        onContextSelection?: (contextPath: string | null) => void;
        value: string | null;
    }
    export type SelectionLevel = 'bucket' | 'scope' | 'collection';
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector/schema-selector.utils" {
    export const validateIsValueInSchema: (value: string | null, dbSchema?: DatabaseSchema) => boolean;
}
declare module "sharedComponents/components/workbench/query-editor/schema-selector" {
    import React from 'react';
    import type { SchemaSelectorProps } from "sharedComponents/components/workbench/query-editor/schema-selector/schema-selector.types";
    export function SchemaSelector({ databaseSchema, selectionLevel, onContextSelection, value }: SchemaSelectorProps): React.JSX.Element;
}
